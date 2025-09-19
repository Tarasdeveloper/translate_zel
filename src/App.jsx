import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import FileDisplay from './components/FileDisplay';
import Information from './components/Information';
import Transcribing from './components/Transcribing';
import { MessageTypes } from './utils/presets';

export default function App() {
    const [file, setFile] = useState(null);
    const [audioStream, setAudioStream] = useState(null);
    const [output, setOutput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [finished, setFinished] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const isAudioAvailable = file || audioStream;

    function handleResetAudio() {
        setFile(null);
        setAudioStream(null);
    }

    const worker = useRef(null);

    useEffect(() => {
        if (!worker.current) {
            worker.current = new Worker(
                new URL('./utils/whisper.worker.js', import.meta.url),
                { type: 'module' }
            );
        }
        const onMessageReceieved = async (e) => {
            switch (e.data.type) {
                case 'DOWNLOADING': {
                    setDownloading(true);
                    console.log('DOWNLOADING');
                    break;
                }
                case 'LOADING': {
                    setLoading(true);
                    console.log('LOADING');
                    break;
                }
                case 'RESULT': {
                    setOutput(e.data.results);
                    console.log(e.data.results);
                    break;
                }
                case 'INFERENCE_DONE': {
                    setFinished(true);
                    console.log('DONE');
                    break;
                }
            }
        };
        worker.current.addEventListener('message', onMessageReceieved);
        return () =>
            worker.current.removeEventListener('message', onMessageReceieved);
    });

    async function readAudioFrom(file) {
        const sampling_rate = 16000;
        const audioCtx = new AudioContext({ sampleRate: sampling_rate });
        const response = await file.arrayBuffer();
        const decoded = await audioCtx.decodeAudioData(response);
        return decoded.getChannelData(0);
    }

    async function handleFormSubmit() {
        if (!file && !audioStream) return;

        let audio = await readAudioFrom(file ? file : audioStream);
        const model_name = `Xenova/whisper-tiny.en`;

        worker.current.postMessage({
            type: MessageTypes.INFERENCE_REQUEST,
            audio,
            model_name,
        });
    }

    return (
        <div className="flex flex-col max-w-[1000px] mx-auto w-full">
            <section className="min-h-screen flex flex-col">
                <Header />
                {output ? (
                    <Information />
                ) : loading ? (
                    <Transcribing />
                ) : isAudioAvailable ? (
                    <FileDisplay
                        handleFormSubmit={handleFormSubmit}
                        handleResetAudio={handleResetAudio}
                        file={file}
                        audioStream={audioStream}
                    />
                ) : (
                    <HomePage
                        setFile={setFile}
                        setAudioStream={setAudioStream}
                    />
                )}
            </section>

            <footer></footer>
        </div>
    );
}
