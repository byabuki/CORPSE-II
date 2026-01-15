import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <h1 className="text-4xl font-bold mb-4 text-white">CORPSE II</h1>
      <Image
        src="/gptsultant.png"
        alt="GPTsultant"
        width={600}
        height={600}
        priority
      />
      <h1 className="text-4xl font-bold mb-4 text-white">COMING SOON</h1>
    </div>
  );
}
