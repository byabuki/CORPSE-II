import Image from 'next/image';

export default function TopBar() {
    return (
        <header className="bg-black border-b border-gray-700 px-6 py-2">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-white">CORe Projection System for Evaluation</h1>
                <Image
                    src="/gunsultant.png"
                    alt="CORPSE II Logo"
                    width={60}
                    height={60}
                    className="rounded"
                />
            </div>
        </header>
    );
}
