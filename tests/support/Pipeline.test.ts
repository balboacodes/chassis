import { expect, test } from 'vitest';
import { Pipeline } from '../src/Pipeline';
import { unset } from '@balboacodes/php-utils';

let $_SERVER = {};

class PipelineTestPipeOne {
    public handle(piped: any, next: (passable: any) => any) {
        $_SERVER['__test.pipe.one'] = piped;

        return next(piped);
    }

    public differentMethod(piped: any, next: (passable: any) => any) {
        return next(piped);
    }
}

test('pipeline basic usage', () => {
    const pipeTwo = (piped: any, next: (passable: any) => any) => {
        $_SERVER['__test.pipe.two'] = piped;

        return next(piped);
    };

    const result = new Pipeline()
        .send('foo')
        .through([new PipelineTestPipeOne(), pipeTwo])
        .then((piped) => piped);

    expect(result).toEqual('foo');
    expect($_SERVER['__test.pipe.one']).toEqual('foo');
    expect($_SERVER['__test.pipe.two']).toEqual('foo');

    unset($_SERVER, '__test.pipe.two');
    unset($_SERVER, '__test.pipe.two');
});

test('pipeline usage with objects', () => {
    const result = new Pipeline()
        .send('foo')
        .through([new PipelineTestPipeOne()])
        .then((piped: any) => piped);

    expect(result).toEqual('foo');
    expect($_SERVER['__test.pipe.one']).toEqual('foo');

    unset($_SERVER, '__test.pipe.one');
});

test('pipeline usage with callable', () => {
    const fn = (piped: any, next: (passable: any) => any) => {
        $_SERVER['__test.pipe.one'] = 'foo';

        return next(piped);
    };

    let result = new Pipeline()
        .send('foo')
        .through([fn])
        .then((piped: any) => piped);

    expect(result).toEqual('foo');
    expect($_SERVER['__test.pipe.one']).toEqual('foo');

    unset($_SERVER, '__test.pipe.one');

    result = new Pipeline().send('bar').through(fn).thenReturn();

    expect(result).toEqual('bar');
    expect($_SERVER['__test.pipe.one']).toEqual('foo');

    unset($_SERVER, '__test.pipe.one');
});

test('pipeline usage with pipe', () => {
    const object = { value: 0 };
    const fn = (object: any, next: (passable: any) => any) => {
        object.value++;

        return next(object);
    };

    const result = new Pipeline()
        .send(object)
        .through([fn])
        .pipe([fn])
        .then((piped: any) => piped);

    expect(result).toEqual(object);
    expect(object.value).toEqual(2);
});

test('pipeline through method overwrites previously set and appended pipes', () => {
    const object = { value: 0 };
    const fn = (object: any, next: (passable: any) => any) => {
        object.value++;

        return next(object);
    };

    const result = new Pipeline()
        .send(object)
        .through([fn])
        .pipe([fn])
        .through([fn])
        .then((piped: any) => piped);

    expect(result).toEqual(object);
    expect(object.value).toEqual(1);
});

test('then method is not called if the pipe returns', () => {
    $_SERVER['__test.pipe.then'] = '(*_*)';
    $_SERVER['__test.pipe.second'] = '(*_*)';

    const result = new Pipeline()
        .send('foo')
        .through([() => 'm(-_-)m', () => ($_SERVER['__test.pipe.second'] = 'm(-_-)m')])
        .then((piped: any) => {
            $_SERVER['__test.pipe.then'] = '(0_0)';

            return piped;
        });

    expect(result).toEqual('m(-_-)m');
    // The then callback is not called.
    expect($_SERVER['__test.pipe.then']).toEqual('(*_*)');
    // The second pipe is not called.
    expect($_SERVER['__test.pipe.second']).toEqual('(*_*)');

    unset($_SERVER, '__test.pipe.then');
});

test('then method input value', () => {
    const result = new Pipeline()
        .send('foo')
        .through([
            (value: any, next: (passable: any) => any) => {
                value = next('::not_foo::');
                $_SERVER['__test.pipe.return'] = value;

                return 'pipe::' + value;
            },
        ])
        .then((piped: any) => {
            $_SERVER['__test.then.arg'] = piped;

            return 'then' + piped;
        });

    expect(result).toEqual('pipe::then::not_foo::');
    expect($_SERVER['__test.then.arg']).toEqual('::not_foo::');

    unset($_SERVER, '__test.then.arg');
    unset($_SERVER, '__test.pipe.return');
});

test('pipeline via changes the method being called on the pipes', () => {
    const pipelineInstance = new Pipeline();
    const result = pipelineInstance
        .send('data')
        .through(new PipelineTestPipeOne())
        .via('differentMethod')
        .then((piped: any) => piped);

    expect(result).toEqual('data');
});

test('pipeline then return method runs pipeline then returns passable', () => {
    const result = new Pipeline().send('foo').through([new PipelineTestPipeOne()]).thenReturn();

    expect(result).toEqual('foo');
    expect($_SERVER['__test.pipe.one']).toEqual('foo');

    unset($_SERVER, '__test.pipe.one');
});

test('pipeline conditionable', () => {
    let result = new Pipeline()
        .send('foo')
        .when(true, (pipeline: Pipeline) => pipeline.pipe([new PipelineTestPipeOne()]))
        .then((piped: any) => piped);

    expect(result).toEqual('foo');
    expect($_SERVER['__test.pipe.one']).toEqual('foo');

    unset($_SERVER, '__test.pipe.one');

    $_SERVER['__test.pipe.one'] = null;

    result = new Pipeline()
        .send('foo')
        .when(false, (pipeline: Pipeline) => pipeline.pipe([new PipelineTestPipeOne()]))
        .then((piped: any) => piped);

    expect(result).toEqual('foo');
    expect($_SERVER['__test.pipe.one']).toEqual(null);

    unset($_SERVER, '__test.pipe.one');
});

test('pipeline finally', () => {
    const pipeTwo = (piped: any, next: (passable: any) => any) => {
        $_SERVER['__test.pipe.two'] = piped;

        next(piped);
    };

    const result = new Pipeline()
        .send('foo')
        .through([new PipelineTestPipeOne(), pipeTwo])
        .finally((piped: any) => ($_SERVER['__test.pipe.finally'] = piped))
        .then((piped) => piped);

    expect(result).toEqual(undefined);
    expect($_SERVER['__test.pipe.one']).toEqual('foo');
    expect($_SERVER['__test.pipe.two']).toEqual('foo');
    expect($_SERVER['__test.pipe.finally']).toEqual('foo');

    unset($_SERVER, '__test.pipe.one');
    unset($_SERVER, '__test.pipe.two');
    unset($_SERVER, '__test.pipe.finally');
});

test('pipeline finally method when chain is stopped', () => {
    const pipeTwo = (piped: any) => {
        $_SERVER['__test.pipe.two'] = piped;
    };

    const result = new Pipeline()
        .send('foo')
        .through([new PipelineTestPipeOne(), pipeTwo])
        .finally((piped: any) => ($_SERVER['__test.pipe.finally'] = piped))
        .then((piped: any) => piped);

    expect(result).toEqual(undefined);
    expect($_SERVER['__test.pipe.one']).toEqual('foo');
    expect($_SERVER['__test.pipe.two']).toEqual('foo');
    expect($_SERVER['__test.pipe.finally']).toEqual('foo');

    unset($_SERVER, '__test.pipe.one');
    unset($_SERVER, '__test.pipe.two');
    unset($_SERVER, '__test.pipe.finally');
});

test('pipeline finally order', () => {
    const std: any = {};
    const result = new Pipeline()
        .send(std)
        .through([
            (std: any, next: (passable: any) => any) => {
                std.value = 1;

                return next(std);
            },
            (std: any, next: (passable: any) => any) => {
                std.value++;

                return next(std);
            },
        ])
        .finally((std: any) => {
            expect(std.value).toEqual(3);

            std.value++;
        })
        .then((std: any) => {
            std.value++;

            return std;
        });

    expect(std.value).toEqual(4);
    expect(result.value).toEqual(4);
});

test('pipeline finally when exception occurs', () => {
    const std: any = {};

    expect(() => {
        try {
            new Pipeline()
                .send(std)
                .through([
                    (std: any, next: (passable: any) => any) => {
                        std.value = 1;
                        return next(std);
                    },
                    (std: any) => {
                        throw new Error('My Exception: ' + std.value);
                    },
                ])
                .finally((std: any) => {
                    expect(std.value).toEqual(1);

                    std.value++;
                })
                .then((std) => {
                    std.value = 0;

                    return std;
                });
        } catch (e: any) {
            expect(std.value).toEqual(2);

            throw e;
        }
    }).toThrow('My Exception: 1');
});
