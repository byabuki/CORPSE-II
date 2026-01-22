import Link from 'next/link';

export default function BottomBar() {
    return (
        <footer className="fixed bottom-0 w-full bg-black border-t border-gray-700 px-6 py-4">
            <nav className="flex justify-center space-x-6">
                <Link
                    href="/"
                    className="text-white hover:text-white transition-colors"
                >
                    Home
                </Link>
            </nav>
        </footer>
    );
}
