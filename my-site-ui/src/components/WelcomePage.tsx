type WelcomePageProps = {
  open: boolean;
};

export default function WelcomePage({ open }: WelcomePageProps) {
  return (
    <main className={`flex ${open ? "ml-64" : ""} min-h-screen w-screen flex-col items-center overflow-auto mt-10 bg-gray-900 px-4`}>
      <div className="h-40 w-90 p-7 m-15 rounded text-white bg-gray-700">
        <p className="font-bold font-serif text-3xl">connexus</p>
        <i>[konˈneksus] Noun, m.</i>
        <p>Connection</p>
      </div>
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">
          Hi, I'm Noah Conn
        </h1>
        <p className="mb-8 text-lg text-white">
          Welcome to my portfolio website. I am a full-stack software engineer with a passion for helping building software that benefits society. Here you can explore my skills, projects, and experience.
        </p>
        {/* <div className="flex justify-center gap-4">
          <a
            href="/articles"
            className="rounded-lg bg-blue-600 px-5 py-2 text-white shadow hover:bg-blue-700"
          >
            View Articles
          </a>
          <a
            href="/projects"
            className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-100"
          >
            See Projects
          </a>
        </div> */}
      </div>
    </main>
  )
}