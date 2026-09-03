export const MASTER_ADMIN_EMAIL="alkos@geita.tz";
export function isMasterAdmin(email:string){return email.trim().toLowerCase()===MASTER_ADMIN_EMAIL;}
export function role(email:string){return isMasterAdmin(email)?"MASTER_ADMIN":"STAFF";}