import Config from '../../Config.ts';
import Facade from './Facade.ts';

/**
 * @see Config
 */
class ConfigFacade {
    // @ts-expect-error
    public static get(key: string, defaultValue: any = null): any {}
    // @ts-expect-error
    public static set(key: Record<string, any> | string, value: any = null): void {}
}

export default Facade.proxy(ConfigFacade, Config);
