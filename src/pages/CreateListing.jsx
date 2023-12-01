import { useState } from "react"

export default function CreateListing() {
    const [formData, setFormData] = useState({
        type: "rent",
    })
    const {type} = formData

    const onChange = () => {

    }

  return (
    <div className="max-w-md px-2 mx-auto">
       <h1 className="text-3xl text-center mt-6 font-bold">
            Create Listing
        </h1> 
        <form>
            <h4 className="text-lg my-6 font-semibold">
                Sell / Rent
            </h4>
            <div className="">
                <button type="button" id="type" value="sale"
                    onClick={onChange}
                    className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded
                    hover:shadow-lg focus:shadow-lg active:shadow-lg transition
                    duration-150 ease-in-out w-full ${
                        type === "rent" ? "bg-white text-black" : "bg-slate-600 text-white"
                    }`}
                >
                    Sell
                </button>
            </div>
        </form>
    </div>
  )
}
