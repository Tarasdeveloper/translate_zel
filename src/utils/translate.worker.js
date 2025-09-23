import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useFS = false;
env.useBrowserCache = false;

class MyTranslationPipeline {
    static task = 'translation';
    static model = 'Xenova/nllb-200-distilled-600M';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, {
                progress_callback,
                revision: 'main',
                cache_dir: 'indexeddb://transformers-cache',
            });
        }

        return this.instance;
    }
}

self.addEventListener('message', async (evt) => {
    let translator = await MyTranslationPipeline.getInstance((x) => {
        self.postMessage(x);
    });
    let output = await translator(evt.data.text, {
        tgt_lang: evt.data.tgt_lang,
        src_lang: evt.data.src_lang,
        callback_function: (x) => {
            self.postMessage({
                status: 'update',
                output: translator.tokenizer.decode(x[0].output_token_ids, {
                    skip_special_tokens: true,
                }),
            });
        },
    });

    self.postMessage({
        status: 'complete',
        output,
    });
});
