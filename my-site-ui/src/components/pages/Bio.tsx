type BioProps = {
  openSide: boolean;
  openConnr: boolean;
};

export default function Bio({ openSide, openConnr }: BioProps) {
  return (
    <main className={`flex ${openSide ? "ml-64" : ""} ${openConnr ? "mr-90" : ""} ${openConnr && !openSide ? "ml-10" : ""} min-h-screen w-screen flex-col items-center overflow-auto mx-auto px-4 bg-gray-900`}>
      <div className="max-w-4xl mt-20 text-left flex-row">
        <div className="flex items-center">
          <h1 className="flex text-4xl pr-3 w-51 font-bold text-white ">
            Noah Conn 
          </h1>
          <a
            href="/Noah_Conn_Resume.pdf"
            download
            className="rounded-lg text-white bg-gradient-to-r w-40 from-orange-300 via-orange-400 to-orange-500 hover:from-orange-400 hover:via-orange-500 hover:to-orange-600 px-3 h-auto py-1"
            >
            Download Resume
          </a>
        </div>
        <h2 className="mb-8 text-gray-500">
          Software Engineer | Full-Stack Web Developer
        </h2>

      <div className="text-gray-300 mb-10 text-md">
        <h2 className="text-white text-xl font-bold">
          Mission Statement
        </h2>
        <p className="sm:md:lg:text-balance max-sm:text-justify">
          I believe part of my life mission is to use technology to improve the lives of individuals. I have a passion for using IT to solve educational, economic, and spiritual problems.
        </p>
      </div>

      {/* PROFESSIONAL SUMMARY */}
      <div className="text-gray-300 mb-10 text-md">
        <h2 className="text-white text-xl font-bold">
          Professional Summary
        </h2>
        <p className="sm:md:lg:text-balance max-sm:text-justify">
          Full-stack software engineer with industry experience building and maintaining web applications. Proficient in design and implementation of intuitive and responsive UIs. Experienced in REST API development. Strong teamwork, leadership, organization, and communication skills. Proven to learn quickly and adapt to diverse situations and complex challenges.
        </p>
      </div>

      {/* SKILLS */}
      <div className="text-gray-300 mb-10 text-md">
        <h2 className="text-white text-xl font-bold">
          Skills
        </h2>
        <ul>
          <li className="mb-2"><b>Languages:</b> Python, Java, JavaScript/Typescript, SQL, HTML/CSS</li>
          <li className="mb-2"><b>Frameworks/Tools:</b> React, Next.js, Spring Boot</li>
          <li className="mb-2"><b>Testing:</b> JUnit, Cypress</li>
          <li className="mb-2"><b>Cloud/DevOps:</b> AWS (Lambda, S3, Cloudwatch, DynamoDB), GitLab, CI/CD Pipelines</li>
          <li className="mb-2"><b>Methodologies:</b> Agile/Scrum</li>
          <li className="mb-2"><b>Other:</b> Spanish (fluent), Communication, Organization, Planning, Time-management</li>
        </ul>
      </div>

      {/* GALLERY */}
      <div className="text-gray-300 mb-2 text-md">
        <h2 className="text-white text-xl font-bold">
          Photo Gallery
        </h2>
      </div>
      <div className="flex flex-wrap gap-2 justify-left">
        <img src="/ISU.jpg" alt="Me at ISU" className="h-60 object-contain rounded-lg shadow"></img>
        <img src="/DomeoftheRock.jpg" alt="Me at Dome of the Rock" className="h-60 object-contain rounded-lg shadow"></img>
        <img src="/My_Woman.jpg" alt="Me and my fiancee, Mary" className="h-60 object-contain rounded-lg shadow"></img>   
        <img src="/Qumran.jpg" alt="Me at Qumran" className="h-60 object-contain rounded-lg shadow"></img>
        <img src="/Conti.jpg" alt="Me at Constitución, Chile" className="h-60 object-contain rounded-lg shadow"></img>
        <img src="/Shark.jpg" alt="Caught a shark in Hilton Head" className="h-60 object-contain rounded-lg shadow"></img>   
        <img src="/Conti2.jpg" alt="Me at Constitución, Chile" className="h-60 object-contain rounded-lg shadow"></img>      
      </div>
      </div>
    </main>
  )
}