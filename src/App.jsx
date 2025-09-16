import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import FileDisplay from './components/FileDisplay';
import Information from './components/Information';
import Transcribing from './components/Transcribing';

export default function App() {
    const [file, setFile] = useState(null);
    const [audioStream, setAudioStream] = useState(null);
    const [output, setOutput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [finished, setFinished] = useState(false);

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
        const onMessageRecieved = async (e) => {};
    }, []);

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
