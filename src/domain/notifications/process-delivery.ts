import { db } from "@/lib/db";
import { formatCrawlFailureMessage, formatScholarshipMessage, sendTelegramMessage } from "./telegram";

export async function processNotificationDelivery(deliveryId:string){
  const delivery=await db.notificationDelivery.findUnique({where:{id:deliveryId}});if(!delivery||delivery.status==="SENT"||delivery.status==="SKIPPED")return;
  await db.notificationDelivery.update({where:{id:deliveryId},data:{attempts:{increment:1},error:null}});
  try{
    let message:string;
    if(delivery.eventType==="SCHOLARSHIP_VERIFIED"){const scholarship=await db.scholarship.findUnique({where:{id:delivery.entityId}});if(!scholarship)throw new Error("Scholarship no longer exists");message=formatScholarshipMessage(scholarship)}
    else if(delivery.eventType==="CRAWL_FAILED"){const job=await db.crawlJob.findUnique({where:{id:delivery.entityId},include:{source:{select:{providerName:true}}}});if(!job)throw new Error("Crawl job no longer exists");message=formatCrawlFailureMessage(job)}
    else if(delivery.eventType==="TEST")message="<b>Bourse Collector connected</b>\nTelegram notifications are configured correctly.";
    else{await db.notificationDelivery.update({where:{id:deliveryId},data:{status:"SKIPPED",error:"Unsupported notification event"}});return}
    const externalMessageId=await sendTelegramMessage(message);await db.notificationDelivery.update({where:{id:deliveryId},data:{status:"SENT",externalMessageId,sentAt:new Date(),error:null}});
  }catch(error){await db.notificationDelivery.update({where:{id:deliveryId},data:{status:"FAILED",error:error instanceof Error?error.message:String(error)}});throw error}
}
