declare const Translator: Translator
// https://developer.mozilla.org/en-US/docs/Web/API/Translator/
type Translator = {
    /** https://developer.mozilla.org/en-US/docs/Web/API/Translator/availability_static */
    availability(options: {sourceLanguage: string, targetLanguage: string}): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>
    /** https://developer.mozilla.org/en-US/docs/Web/API/Translator/create_static */
    create(options: {sourceLanguage: string, targetLanguage: string, monitor?: (...args: unknown[]) => unknown, signal?: AbortSignal}): TranslatorInstance
}

type TranslatorInstance = {
    destroy(): void,
    measureInputUsage(input: string, options?: {signal: AbortSignal}): Promise<number>,
    translate(input: string, options?: {signal: AbortSignal}): Promise<string>,
    translateStreaming(input: string, options?: {signal: AbortSignal}): ReadableStream,
}

// TODO: get myself a better tsc version
declare namespace Intl {
    class Locale {
        constructor(language: string);
        script?: string;
        language: string;
    }
}

let tryTranslator = 'Translator' in self;

let translator: TranslatorInstance | undefined = undefined;
let targetLanguage: string | undefined = undefined;

async function findTargetLanguage(): Promise<string | undefined> {
    for (const language of navigator.languages) {
        const locale = new Intl.Locale(language);
        const normalizedLanguage = locale.script ? `${locale.language}-${locale.script}` : locale.language;
        if (normalizedLanguage === 'en') {
            tryTranslator = false;
            return undefined;
        }
        try {
            const availability = await Translator.availability({sourceLanguage: 'en', targetLanguage: normalizedLanguage});
            if (availability !== 'unavailable') {
                return normalizedLanguage;
            }
        } catch {
            continue;
        }
    }
    tryTranslator = false;
    return undefined;
}

async function translateWithExistingTranslator(s: string, translator: TranslatorInstance, retriesRemaining: number = 3): Promise<string> {
    if (retriesRemaining <= 0) {
        tryTranslator = false;
        return s;
    } 
    // TODO: always try new translator on last retry?
    // (not this, it causes an infinite loop)
    // else if (retriesRemaining == 1) {
    //     return translateWithNewTranslator(s, retriesRemaining);
    // }

    try {
        return await translator.translate(s);
    } catch (e) {
        if (e instanceof DOMException){
            switch (e.name) {
                case 'QuotaExceededError':
                    console.error(e);
                    return s;
                case 'AbortError':
                    return translateWithNewTranslator(s, retriesRemaining - 1);
                case 'InvalidStateError':
                default:
                    return translateWithExistingTranslator(s, translator, retriesRemaining - 1);
            }
        } else {
            console.error(e);
            return s;
        }
    }
}

async function translateWithNewTranslator(s: string, retriesRemaining: number): Promise<string> {
    if (retriesRemaining <= 0) {
        tryTranslator = false;
        return s;
    } else if (!targetLanguage) {
        console.error('Translation Error: target language somehow became undefined after it was defined');
        return s;
    }

    try {
        translator = Translator.create({sourceLanguage: 'en', targetLanguage});
        return translateWithExistingTranslator(s, translator, retriesRemaining);
    } catch (e) {
        if (e instanceof DOMException) {
            switch (e.name) {
                case 'NotAllowedError':
                    console.error(e);
                case 'NotSupportedError':
                    // shouldn't be possible, as availability should already have been determined
                    tryTranslator = false;
                    return s;
                case 'NetworkError':
                case 'InvalidStateError':
                case 'OperationError':
                default:
                    return translateWithNewTranslator(s, retriesRemaining - 1);
            }
        } else {
            return s;
        }
    }
}

async function translate(s: string): Promise<string> {
    if (translator) {
        return translateWithExistingTranslator(s, translator, 3);
    } 
    
    targetLanguage = await findTargetLanguage();

    if (tryTranslator && targetLanguage) {
        return translateWithNewTranslator(s, 3);
    } else {
        return s;
    }
}

const phrases: Record<string, string> = {
    foo: "The quick red fox jumped over the lazy brown dog.",
    noWorkers: "Browser does not support web workers. Please use a more modern browser."
}

if (tryTranslator) {
    document.body.addEventListener("load", async () => {
        console.log("load event listened");
        for (const key in phrases) {
            phrases[key] = await translate(phrases[key]);
        }
        console.log("translated phrases: ", phrases);
    })
}