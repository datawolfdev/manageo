
export default function ContactComponent({ Contact }) {
    return (
        <div className="m-5 flex flex-col gap-6">
            <div className={`flex flex-col w-96 justify-center`}>
                <div className={`relative w-full flex flex-row cursor-pointer`}>
                    <input
                        onChange={(e) => Contact.setContactInputValue(e.target.value)}
                        onKeyPress={(e) => Contact.handleContactAddOrRemove(e, Contact.contactInputValue)}
                        type="search"
                        id="search-dropdown"
                        aria-describedby="floating_helper_text"
                        className={`block rounded-l-lg px-2.5 pb-2.5 pt-5 w-full text-sm text-white bg-gray-950 border border-gray-700 appearance-none focus:outline-none focus:ring-0 focus:border-cyan-600 peer`}
                        placeholder=" " required
                        value={Contact.contactInputValue}
                    />
                    <label htmlFor="search-dropdown" className={`absolute cursor-pointer text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-2.5 peer-focus:text-cyan-600 peer-focus peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto`}>Contact à enrichir</label>
                    <button onClick={(e) => Contact.contactInputValue && Contact.contactInputValue.length > 0 && Contact.handleContactAddOrRemove(e, Contact.contactInputValue, true)} style={{ paddingBottom: "15px", paddingTop: "15px" }} type="submit" className={`px-2.5 h-full text-sm font-medium text-white bg-cyan-700 rounded-e-lg border border-cyan-700 hover:bg-cyan-800 focus:ring-4 focus:outline-none focus:ring-cyan-300`}>
                        <svg className={`w-5 h-5 transition-transform group-hover:rotate-45`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
                        </svg>
                    </button>
                </div>
                <div className={`m-1 flex flex-wrap`}>
                    {Contact.selectedContact.length > 0 && Contact.selectedContact.map((element, index) => (
                        <kbd
                            key={index}
                            className={`px-2 py-1.5 text-xs font-semibold text-white bg-gray-900 border border-gray-800 rounded-lg`}
                            onClick={() => Contact.removeContactField(element)}
                        >
                            {element}
                            <span className={`cursor-pointer text-red-500 hover:text-red-700`}> ×</span>
                        </kbd>
                    ))}
                </div>
                <p id="floating_helper_text" className={` mt-2 px-1 text-xs text-white`}>exemple : PDG, CEO... validez pas enter ou en cliquant sur le +</p>
            </div>
            <div className={`flex flex-col w-full justify-center`}>
                <label htmlFor="countries" className={`block mb-2 text-sm font-medium text-white`}>Contact par profil (facultatif)</label>
                <select
                    id="profile"
                    value={Contact.selectedProfil}
                    onChange={(event) => Contact.setSelectedProfil(event.target.value)}
                    className={`bg-gray-950 border border-gray-700 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5`}>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                </select>
            </div>
        </div>
    )
}