import { db } from "@/lib/db";
import { config, hasTelegramProvider } from "@/lib/config";
import { enqueueNotification } from "@/lib/queue";

async function enabled(key:string){const setting=await db.systemSetting.findUnique({where:{key}});return setting?.value===true}

async function createDelivery(eventType:string,entityType:string,entityId:string,force=false){
  if(!hasTelegramProvider)return null;
  if(!force&&!(await enabled("notifications.telegram.enabled")))return null;
  try{const delivery=await db.notificationDelivery.create({data:{channel:"TELEGRAM",eventType,entityType,entityId,recipient:config.TELEGRAM_CHAT_ID!}});await enqueueNotification(delivery.id);return delivery}
  catch(error){if(typeof error==="object"&&error!==null&&"code" in error&&error.code==="P2002")return db.notificationDelivery.findFirst({where:{channel:"TELEGRAM",eventType,entityId,recipient:config.TELEGRAM_CHAT_ID!}});throw error}
}

export async function scheduleVerifiedScholarshipNotification(scholarshipId:string){if(!(await enabled("notifications.telegram.verifiedScholarships")))return null;return createDelivery("SCHOLARSHIP_VERIFIED","Scholarship",scholarshipId)}
export async function scheduleCrawlFailureNotification(crawlJobId:string){if(!(await enabled("notifications.telegram.crawlFailures")))return null;return createDelivery("CRAWL_FAILED","CrawlJob",crawlJobId)}
export async function scheduleTelegramTest(){return createDelivery("TEST","System",`test-${Date.now()}`,true)}

export async function recoverPendingNotifications(){return db.notificationDelivery.findMany({where:{status:"PENDING"},select:{id:true}})}
