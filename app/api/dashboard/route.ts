import {NextResponse} from "next/server";import {db} from "@/lib/mongodb";
export async function GET(){const d=await db();const now=new Date(),start=new Date(now);start.setDate(now.getDate()-6);start.setHours(0,0,0,0);
const rooms=await d.collection("rooms").find({}).sort({number:1}).toArray();const tx=await d.collection("transactions").find({createdAt:{$gte:start}}).sort({createdAt:-1}).limit(200).toArray();
const revenue=tx.filter(x=>x.type==="REVENUE").reduce((a,x)=>a+Number(x.amount||0),0),expenses=tx.filter(x=>x.type==="EXPENSE").reduce((a,x)=>a+Number(x.amount||0),0);
const debts=await d.collection("debts").aggregate([{$match:{balance:{$gt:0}}},{$group:{_id:null,total:{$sum:"$balance"}}}]).toArray();
const discounts=await d.collection("bookings").aggregate([{$match:{createdAt:{$gte:start}}},{$group:{_id:null,total:{$sum:"$discount"}}}]).toArray();const occupied=rooms.filter(r=>r.status==="OCCUPIED").length;
return NextResponse.json({rooms,transactions:tx,summary:{revenue,expenses,profit:revenue-expenses,debt:debts[0]?.total||0,discounts:discounts[0]?.total||0,occupied,rooms:rooms.length,occupancy:rooms.length?Math.round(occupied/rooms.length*100):0}})}