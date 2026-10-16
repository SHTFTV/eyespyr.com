import {createFileRoute} from "@tanstack/react-router";
import {JournalPage} from "@/components/ContentJournal";
export const Route=createFileRoute("/journal/")({head:()=>({meta:[{title:"EyeSpyR journal | Practical reading"}]}),component:JournalPage});
