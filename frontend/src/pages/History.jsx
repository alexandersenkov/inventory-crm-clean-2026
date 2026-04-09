import { useEffect, useState } from "react"
import axios from "axios"

export default function History() {
  const [data, setData] = useState([])

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/history")
      .then(res => setData(res.data))
  }, [])

  return (
    <div className="p-6">
      <h2>История</h2>

      {data.map(item => (
        <div key={item.id}>
          {item.action} | ID: {item.item_id} | {item.user}
        </div>
      ))}
    </div>
  )
}
