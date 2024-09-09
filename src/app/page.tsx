import Cards from "./Card/page"
import Photos from "./Photo/page"
import TreeComponent from "./Tree/page"

export default function Home() {
  return (
    <main className="flex justify-center items-center h-screen">
      {/* <div className="flex w-64 bg-emerald-200 h-screen">
    //     <Photos></Photos>
    //   </div>
    //   <Cards></Cards> */}
      <TreeComponent></TreeComponent>
    </main>
  )
}

