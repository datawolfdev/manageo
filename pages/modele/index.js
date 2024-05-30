import { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import axios from 'axios';
import SpeedDial from '@/components/speedDialComponent';
import checkAuth from '@/lib/checkAuth';

export default function CreateEmail({ userData }) {
    const editorRef = useRef(null);
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!editorRef.current) {
            editorRef.current = grapesjs.init({
                container: '#gjs',
                height: 'auto',
                width: 'auto',
                fromElement: true,
                storageManager: false,
                blockManager: {
                    appendTo: '#blocks',
                    blocks: [
                        {
                            id: 'section',
                            label: '<b>Section</b>',
                            attributes: { class: 'gjs-block-section' },
                            content: `<section>
                                <h1>Section Title</h1>
                                <p>This is a simple section</p>
                            </section>`,
                        },
                        {
                            id: 'text',
                            label: 'Text',
                            content: '<div data-gjs-type="text">Insert your text here</div>',
                        },
                        {
                            id: 'image',
                            label: 'Image',
                            content: { type: 'image' },
                            select: true,
                        },
                        {
                            id: 'button',
                            label: 'Button',
                            content: '<button class="btn">Button</button>',
                        }
                    ],
                },
            });

            const defaultContent = `
                <div style="max-width: 700px; margin: 0 auto; border-radius: 10px; background-color: #f2f2f2; padding: 20px; text-align: center; overflow-wrap: break-word;">
                    <h1 style="color: #333; margin: 10px 0;">Confirmation de désinscription</h1>
                    <H2 style="font-size: 22px; color: #777; margin: 10px 0;">Bonjour {{gender}} {{lastName}} {{firstName}}</h2>
                    <p style="font-size: 16px; color: #777; margin: 10px 0;">Veuillez cliquer sur le bouton ci-dessous pour vous désinscrire.</p>
                    <div style="margin: 6%;">
                        <a href="https://{{domaine}}/unsubscribe?uuid={{uuid}}" style="text-decoration: none; color: #fff; background-color: #7e22ce; border-radius: 5px; padding: 10px 20px; display: inline-block;">Se désinscrire</a>
                    </div>
                </div>
            `;
            editorRef.current.setComponents(defaultContent);
        }
    }, []);

    const inlineStyles = (htmlContent, cssContent) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const styleSheet = cssContent.split('}').reduce((acc, rule) => {
            const [selector, styles] = rule.split('{');
            if (selector && styles) {
                acc[selector.trim()] = styles.trim();
            }
            return acc;
        }, {});

        Object.keys(styleSheet).forEach(selector => {
            const elements = doc.querySelectorAll(selector);
            elements.forEach(el => {
                const styles = styleSheet[selector];
                el.setAttribute('style', styles);
            });
        });

        return doc.body.innerHTML;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!name) newErrors.name = 'Le nom est obligatoire.';
        if (!subject) newErrors.subject = 'Le sujet est obligatoire.';
        if (!editorRef.current) {
            return;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        try {
            const htmlContent = editorRef.current.getHtml();
            const cssContent = editorRef.current.getCss();
            const combinedContent = inlineStyles(htmlContent, cssContent);
            console.log(combinedContent);
            const response = await axios.post('/api/other/create', { name, subject, html_content: combinedContent });
            setMessage(response.data.message);
        } catch (error) {
            setMessage('Erreur lors de la sauvegarde de l\'email.');
        }
    };

    return (
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 overflow-auto h-full">
            <SpeedDial userData={userData} />
            <form onSubmit={handleSubmit} className="grid grid-cols-12 grid-rows-12 justify-center items-center w-full h-full">
                <h1 className="row-start-1 row-span-1 col-start-2 col-span-10 flex justify-center items-center">Création du message</h1>
                <div className="row-start-2 row-span-1 col-start-2 col-span-10 flex flex-row justify-between w-full gap-24">
                    <div className="relative w-full flex flex-col cursor-pointer">
                        <input
                            onChange={(e) => setName(e.target.value)}
                            type="text"
                            id="name"
                            className="block rounded-md px-2.5 pb-2.5 pt-5 w-full text-sm text-white bg-gray-950 border border-gray-700 appearance-none focus:outline-none focus:ring-0 focus:border-cyan-600 peer"
                            placeholder=" "
                            value={name}
                            required
                        />
                        <label htmlFor="name" className="absolute cursor-pointer text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-2.5 peer-focus:text-cyan-600 peer-focus peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Nom du mail</label>
                        {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                    </div>
                    <div className="relative w-full flex flex-col cursor-pointer">
                        <input
                            onChange={(e) => setSubject(e.target.value)}
                            type="text"
                            id="subject"
                            className="block rounded-md px-2.5 pb-2.5 pt-5 w-full text-sm text-white bg-gray-950 border border-gray-700 appearance-none focus:outline-none focus:ring-0 focus:border-cyan-600 peer"
                            placeholder=" "
                            value={subject}
                            required
                        />
                        <label htmlFor="subject" className="absolute cursor-pointer text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-2.5 peer-focus:text-cyan-600 peer-focus peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Sujet</label>
                        {errors.subject && <span className="text-red-500 text-sm">{errors.subject}</span>}
                    </div>
                    <div className="relative w-full flex flex-col cursor-pointer">
                        <button type="submit" className="relative h-12 w-full items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-r-2 border-t-2 border-gray-900 rounded-lg">
                            <span className="relative flex justify-center items-center h-full w-full p-1 text-white">Sauvegarde</span>
                            <div className="h-2 w-full bg-gradient-to-l via-cyan-500 group-hover:blur-xl blur-2xl m-auto rounded transition-all absolute bottom-0"></div>
                            <div className="h-0.5 group-hover:w-full bg-gradient-to-l via-cyan-950 group-hover:via-cyan-500 w-[70%] m-auto rounded transition-all"></div>
                        </button>
                    </div>
                </div>
                <div className="row-start-3 col-start-2 row-span-9 col-span-10 flex h-full w-full grid grid-cols-8 grid-rows-9">
                    <div id="blocks" className="row-start-1 col-span-8 row-span-2 overflow-auto"></div>
                    <div id="gjs" className="row-start-3 col-span-8 row-span-9"></div>
                </div>
                <div className="row-start-12 col-start-2 col-span-10 flex h-full w-full justify-center items-center">
                    {message && <p className="text-green-500">{message}</p>}
                </div>
            </form>
        </div>
    );
}

export const getServerSideProps = async (context) => {
    return checkAuth(context);
};
