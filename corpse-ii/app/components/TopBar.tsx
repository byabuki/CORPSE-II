import Image from 'next/image';

export default function TopBar() {
    return (
        <header className="bg-black border-b border-gray-700 px-6 py-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">CORe Projection System for Evaluation</h1>
                <Image
                    src="/gptsultant.png"
                    alt="CORPSE II Logo"
                    width={80}
                    height={80}
                    className="rounded"
                />
            </div>
        </header>
    );
}
