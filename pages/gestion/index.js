import EmailsGestion from "@/components/gestion/emailComponent";
import UserGestion from "@/components/gestion/userComponent";
import SpeedDial from "@/components/speedDialComponent";
import checkAuth from "@/lib/checkAuth";
import { useState } from "react";
import { pool } from "@/db";
import EmailTemplateGestion from "@/components/gestion/emailTemplateComponent";

export default function Gestion({ userData, users, emails, templates }) {
    const [selectedTable, setSelectedTable] = useState("emails");
    const isAdmin = userData.admin === true;

    return (
        <section className="bg-gradient-to-r from-slate-800 to-slate-900 overflow-auto h-full">
            <SpeedDial userData={userData} />
            <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16">
                {isAdmin && (
                    <div className="container flex gap-20 w-full justify-center items-center mb-8">
                        {["emails", "modeles", "users"].map((table, idx) => (
                            <div key={table} className="radio-wrapper">
                                <input
                                    type="radio"
                                    id={`value-${idx + 1}`}
                                    name="btn"
                                    className="input"
                                    value={table}
                                    checked={selectedTable === table}
                                    onChange={(e) => setSelectedTable(e.target.value)}
                                />
                                <label htmlFor={`value-${idx + 1}`} className="btn">
                                    <span className="relative flex justify-center items-center z-[1000] cursor-pointer">{table.charAt(0).toUpperCase() + table.slice(1)}</span>
                                    <span aria-hidden={true} className="btn__glitch">_{table.toUpperCase()}🦾</span>
                                    <span className="number">r{idx + 1}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                )}
                {selectedTable === "users" && isAdmin && <UserGestion users={users} />}
                {selectedTable === "emails" && <EmailsGestion emailsData={emails} />}
                {selectedTable === "modeles" && <EmailTemplateGestion templates={templates} />}
            </div>
        </section>
    );
}

export async function getServerSideProps(context) {
    const authResult = await checkAuth(context);

    if (authResult?.props?.userData) {
        const client = await pool.connect();
        try {
            const [usersResult, emailsResult, emailsTemplate] = await Promise.all([
                client.query("SELECT * FROM users"),
                client.query("SELECT * FROM emails"),
                client.query("SELECT * FROM emails_templates")
            ]);

            const users = usersResult.rows.map(user => ({
                ...user,
                created_at: user.created_at ? user.created_at.toISOString() : null
            }));

            const emails = emailsResult.rows.map(email => ({
                ...email,
                added_at: email.added_at ? email.added_at.toISOString() : null,
                deactivated_at: email.deactivated_at ? email.deactivated_at.toISOString() : null
            }));

            const templates = emailsTemplate.rows.map(template => ({
                ...template,
                created_at: template.created_at ? template.created_at.toISOString() : null,
            }));

            return {
                props: {
                    ...authResult.props,
                    users,
                    emails,
                    templates,
                }
            };
        } catch (error) {
            console.error("Error fetching data:", error);
            return { props: { ...authResult.props, users: [], emails: [] } };
        } finally {
            client.release();
        }
    }

    return authResult;
}