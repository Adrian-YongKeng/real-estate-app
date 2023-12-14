import { useState } from "react"

export default function Contact({listing}) {
   const [message, setMessage] = useState("");

    const onChange = (e) => {
        e.preventDefault
        setMessage(e.target.value)
    }

  return (
    <div className="flex flex-col w-full">
        <p>
            Contact <span className="font-semibold">{listing.username}</span> for the <span className="font-semibold">{listing.title}</span>
        </p> 
        <div className="mt-3 mb-4">
            <textarea name="message"
                id="message"
                rows={3} 
                value={message}
                onChange={onChange}
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border
                 border-gray-300 rounded transition duration-150 ease-in-out
                 focus:text-gray-700 focus:bg-white focus:border-red-400"
            ></textarea>
        </div>
        <a href={`mailto:${listing.email}?Subject=${listing.title}&body=${message}`}>
            <button className="px-7 py-3 bg-red-400 text-white rounded uppercase shadow-md
             hover:bg-red-500 hover:shadow-lg focus:bg-red-500 focus:shadow-lg active:bg-red-600 
             active:shadow-lg transition duration-150 ease-in-out w-full text-center mb-6">
                Send Message
            </button>
        </a>
    </div>
    
  )
}
