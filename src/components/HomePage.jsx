import { useEffect, useRef, useState } from 'react';

export default function HomePage({ setFile, setAudioStream }) {
    const [recordingStatus, setRecordingStatus] = useState('inactive');
    const [audioChunks, setAudioChunks] = useState([]);
    const [duration, setDuration] = useState(0);

    const mediaRecorder = useRef(null);
    let mimeType = 'audio/webm;codecs=opus';
    // const mimeType = 'audio/ogg';

    if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/ogg;codecs=opus';
    }

    async function startRecording() {
        let tempStream;
        console.log('start recording');
        try {
            const streamData = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            });
            tempStream = streamData;
        } catch (err) {
            console.log(err.message);
            return;
        }
        setRecordingStatus('recording');

        // create media recorder instance using the stream
        const media = new MediaRecorder(tempStream, { mimeType });
        mediaRecorder.current = media;

        mediaRecorder.current.start();
        //     if (e.data && e.data.size > 0) {
        //         setAudioChunks((prev) => [...prev, e.data]);
        //     }
        let localAudioChunks = [];
        mediaRecorder.current.ondataavailable = (e) => {
            if (typeof e.data === 'undefined' || e.data.size === 0) return;
            localAudioChunks.push(e.data);
        };
        setAudioChunks(localAudioChunks);
    }

    async function stopRecording() {
        setRecordingStatus('inactive');
        console.log('stop recording');

        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            setAudioStream(audioBlob);
            setAudioChunks([]);
            setDuration(0);
        };
    }

    useEffect(() => {
        if (recordingStatus === 'inactive') return;

        const interval = setInterval(() => {
            setDuration((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    });

    return (
        <main className="flex-1 p-4 flex flex-col gap-3 text-center sm:gap-4 justify-center pb-20">
            <h1 className="font-semibold text-5xl sm:text-6xl md:text-7xl">
                Free <span className="text-blue-400 bold">Scribe</span>
            </h1>
            <h3 className="font-medium md:text-lg">
                Record <span className="text-blue-400">&rarr;</span> Ttanscribe{' '}
                <span className="text-blue-400">&rarr;</span> Translate
            </h3>
            <button
                onClick={
                    recordingStatus === 'recording'
                        ? stopRecording
                        : startRecording
                }
                className="flex specialBtn px-4 py-2 rounded-xl items-center text-base justify-between gap-4 mx-auto w-72 max-w-full my-4"
            >
                <p className="text-blue-400">
                    {recordingStatus === 'inactive'
                        ? 'Record'
                        : 'Stop recording'}
                </p>
                <div className="flex items-center gap-2">
                    {duration && <p className="text-sm">{duration}s</p>}
                    <i
                        className={
                            'fa-solid duration-200 fa-microphone ' +
                            (recordingStatus === 'recording'
                                ? ' text-rose-300'
                                : '')
                        }
                    ></i>
                </div>
            </button>
            <p className="text-base">
                Or{' '}
                <label className="cursor-pointer text-blue-400 hover:text-blue-600 duration-200">
                    upload{' '}
                    <input
                        onChange={(e) => setFile(e.target.files[0])}
                        className="hidden"
                        type="file"
                        accept=".mp3,.wav"
                    />{' '}
                </label>
                a mp3 file
            </p>
            <p className="italic text-slate-400">Free now free forever</p>
        </main>
    );
}
