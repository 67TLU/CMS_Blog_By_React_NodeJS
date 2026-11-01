import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, queryString } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export default function CommentReportsPage() {
  const [status, setStatus] = useState("PENDING");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToast } = useToast();
  useEffect(() => {
    let active = true;
    api.get(`/admin/comment-reports${queryString({ status, page: 1, limit: 50 })}`)
      .then((res) => { if (active) { setReports(res?.data?.items || []); setError(""); } })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status]);
  const handle = async (report, decision) => {
    const body = decision === "RESOLVED"
      ? { status: "RESOLVED", action: "HIDE_COMMENT" }
      : { status: "REJECTED", action: "NONE" };
    try { await api.patch(`/admin/comment-reports/${report.id}`, body); setReports((list) => list.filter((item) => item.id !== report.id)); addToast(decision === "RESOLVED" ? "Đã xử lý báo cáo" : "Đã từ chối báo cáo"); }
    catch (err) { addToast(err.message || "Không xử lý được báo cáo", "error"); }
  };
  return <div className="space-y-6"><div><h1 className="flex items-center gap-2 text-2xl font-bold"><ShieldCheck className="h-6 w-6 text-red-500"/>Báo cáo bình luận</h1><p className="text-xs text-muted-foreground">Xem và xử lý bình luận bị người dùng báo cáo</p></div><div className="flex flex-wrap gap-2">{[{value:"PENDING",label:"Chờ xử lý"},{value:"RESOLVED",label:"Đã xử lý"},{value:"REJECTED",label:"Đã từ chối"}].map(item=><Button key={item.value} variant={status===item.value?"default":"outline"} size="sm" onClick={()=>setStatus(item.value)}>{item.label}</Button>)}</div>{error&&<div className="rounded-lg border border-amber-500/30 p-4 text-sm">{error}<Button className="ml-2" variant="outline" onClick={()=>window.location.reload()}>Thử lại</Button></div>}{loading?<div className="flex justify-center py-12"><Loader2 className="animate-spin"/></div>:!reports.length?<div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">Không có báo cáo ở trạng thái này.</div>:<div className="space-y-4">{reports.map(report=><article key={report.id} className="space-y-4 rounded-xl border border-border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-red-500">Báo cáo #{report.id} · {report.reason}</p><p className="mt-1 text-xs text-muted-foreground">Người báo cáo: {report.reporter} · {report.createdAt?new Date(report.createdAt).toLocaleString("vi-VN"):""}</p></div><span className="rounded-full border border-border bg-muted px-3 py-1 text-xs">{report.status}</span></div><div className="rounded-lg border border-border bg-muted/50 p-4"><p className="text-xs font-semibold text-muted-foreground">Nội dung bình luận</p><p className="mt-2 whitespace-pre-wrap text-sm">{report.comment?.content}</p>{report.note&&<p className="mt-2 text-xs text-muted-foreground">Ghi chú: {report.note}</p>}</div>{status==="PENDING"&&<div className="flex flex-wrap justify-end gap-2"><Button variant="outline" size="sm" onClick={()=>handle(report,"REJECTED")}><XCircle className="mr-1 h-4 w-4"/>Từ chối báo cáo</Button><Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={()=>handle(report,"RESOLVED")}><AlertTriangle className="mr-1 h-4 w-4"/>Xử lý bình luận</Button></div>}{status!=="PENDING"&&<p className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle className="h-4 w-4 text-green-500"/>Báo cáo đã được xử lý.</p>}</article>)}</div>}</div>;
}
