type HomeProps = {
  openSide: boolean;
  openConnr: boolean;
};

export default function Home({ openSide, openConnr }: HomeProps) {
  return (
    <main className={`flex ${openSide ? "ml-64" : ""} ${openConnr ? "mr-90" : ""} min-h-screen w-screen flex-col items-center mt-10 bg-gray-900 px-4`}>
      <div className="h-40 w-90 p-7 m-15 rounded text-white bg-gray-700">
        <p className="font-bold font-serif text-3xl">connexus</p>
        <i>[konˈneksus] Noun, m.</i>
        <p>Connection</p>
      </div>
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">
          Hi, I'm Noah Conn
        </h1>
        <p className="mb-8 text-lg text-white text-balance">
          Welcome to my portfolio website. I am a full-stack software engineer with a passion for helping building software that benefits society. Here you can explore my skills, projects, and experience.
        </p>
      </div>
    </main>
  )
}