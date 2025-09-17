export default function Transcribing({ downloading }) {
    return (
        <div className="flex items-center flex-1 flex-col justify-center gap-10 md:gap-14 pb-24 p-4 text-center">
            <div className="flex flex-col gap-2 sm:gap-4">
                <h1 className="font-semibold text-3xl sm:text-5xl md:text-6xl">
                    <span className="text-blue-400 bold">Transcribing</span>
                </h1>
                <p>{!downloading ? 'Please wait...' : 'Downloading...'}</p>
            </div>
            <div className="flex flex-col gap-2 sm:gap-3 max-w-[400px] mx-auto w-full">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className={
                            'rounded-full h-2 sm:h-3 bg-slate-400 loading ' +
                            `loading${i}`
                        }
                    ></div>
                ))}
            </div>
        </div>
    );
}
