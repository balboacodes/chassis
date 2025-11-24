export class ChassisRequest extends Request {
    public constructor(req: Request, protected params: URLPatternResult | undefined) {
        super(req);
    }

    public async all(): Promise<Record<string, unknown>> {
        return {
            ...this.getPathParams(),
            ...this.getSearchParams(),
            ...await this.getFormData() ?? {},
            ...await this.getJsonData() ?? {},
        };
    }

    protected getPathParams(): Record<string, string | undefined> | undefined {
        return this.params?.pathname.groups;
    }

    protected getSearchParams(): Record<string, string> {
        return Object.fromEntries(new URLSearchParams(this.params?.search.input).entries());
    }

    protected async getFormData(): Promise<Record<string, FormDataEntryValue> | undefined> {
        try {
            return Object.fromEntries((await this.formData()).entries());
        } catch {
            return undefined;
        }
    }

    protected async getJsonData(): Promise<Record<string, unknown> | unknown> {
        try {
            return await this.json();
        } catch {
            return undefined;
        }
    }
}
