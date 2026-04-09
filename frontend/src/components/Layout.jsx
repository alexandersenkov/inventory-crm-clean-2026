import { Link } from "react-router-dom"

export default function Layout({ children }) {
  return (
    <div className="flex h-screen">

      {/* SIDEBAR */}
      <div className="w-60 bg-white border-r p-4">

        <h2 className="text-xl mb-6 font-bold">CRM</h2>

        <nav className="flex flex-col gap-3">
          <Link className="hover:bg-blue-500 hover:text-white p-2" to="/">
            Dashboard
          </Link>

          <Link className="hover:bg-blue-500 hover:text-white p-2" to="/equipment">
            Оборудование
          </Link>

          <Link className="hover:bg-blue-500 hover:text-white p-2" to="/history">
            История
          </Link>
        </nav>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-6 bg-gray-50">
        {children}
      </div>
    </div>
  )
}
