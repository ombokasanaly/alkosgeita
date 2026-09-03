import {db} from "./mongodb";
export async function audit(action:string,actorEmail:string,entity:string,details:unknown={}){
 const d=await db(); await d.collection("audit_logs").insertOne({action,actorEmail,entity,details,createdAt:new Date()});
}