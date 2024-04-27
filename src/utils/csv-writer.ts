import { format } from '@fast-csv/format';
import { Observable } from "rxjs";

interface ICsvWriterCallbacks<R> {
    onWrite?: (record: R) => void;
    onFailure?: (record: R, error: unknown) => void;
    onComplete?: () => void;
}

interface ICsvStreamWriterResult {
    total: number;
    success: number;
    failed: number;
}

export class CsvWriter<R> {

    constructor(
        private readonly callbacks: ICsvWriterCallbacks<R> = {}
    ) {}

    write(observable: Observable<R>, writable: NodeJS.WritableStream): Promise<ICsvStreamWriterResult> {
        const stream = format({ headers: true });
        stream.pipe(writable);

        return new Promise<ICsvStreamWriterResult>(
            (resolve, reject) => {
                const result: ICsvStreamWriterResult = {
                    total: 0,
                    success: 0,
                    failed: 0
                };

                observable.subscribe({
                    next: record => {
                        try {
                            stream.write(record);
                            this.callbacks.onWrite?.(record);
                            result.success++;
                        } catch (e) {
                            result.failed++;
                            this.callbacks.onFailure?.(record, e);
                        }
                    },
                    error: error => {
                        stream.end();
                        reject(error);
                    },
                    complete: () => {
                        stream.end();
                        this.callbacks.onComplete?.();
                        resolve(result);
                    }
                });
            }
        );
    }
}