import{o as e}from"./rolldown-runtime-BCiCTKAo.js";import{Ct as t,Dn as n,Fn as r,Gt as i,H as a,In as o,L as s,Mn as c,Pn as l,Rt as u,Sn as d,Tt as f,Vn as p,Xn as m,Yn as h,_n as g,_t as _,dn as v,fn as y,it as b,jt as x,kn as S,li as C,nt as w}from"./vendor-D4XiiE8_.js";import{l as T,n as E}from"./vendor-router-NRCqE3J9.js";import{t as D}from"./PublicLayout-ChAzcjhU.js";import{t as O}from"./ArticleCard-P_ALZe8x.js";import{n as k,t as A}from"./api-DY-WEbb-.js";import{n as j}from"./articleAdapter-B1XdRlQh.js";import{n as M}from"./ToastContext-lCONYcg8.js";import{a as N,c as P,d as F,i as I,l as L,o as R,r as z,s as B,u as V}from"./index-FnBq7W_F.js";import{t as H}from"./badge-CGiEis2N.js";import{n as U,r as W,t as G}from"./avatar-Cr5WAJTY.js";import{t as K}from"./textarea-DMQwtedB.js";import{B as q,a as J,c as Y,d as ee,f as te,i as X,l as ne,n as re,o as ie,p as ae,r as oe,s as se,t as ce,u as le,z as ue}from"./vendor-react-DBlDi64V.js";import{t as Z}from"./utils-CTXJMmbP.js";import de from"./NotFoundPage-CYyD6zPZ.js";var Q=e(C(),1);function fe(e,t=new Date().toISOString()){let n=new Date(e),r=new Date(t);if(Number.isNaN(n.getTime()))return typeof e==`string`?e:``;let i=n-r,a=Math.abs(i),o=[{name:`year`,value:31536e6},{name:`month`,value:2628e6},{name:`day`,value:864e5},{name:`hour`,value:36e5},{name:`minute`,value:6e4},{name:`second`,value:1e3}];if(a<1e4)return i>=0?`vài giây nữa`:`vài giây trước`;let s=new Intl.RelativeTimeFormat(`vi`,{numeric:`always`});for(let e of o)if(a>=e.value||e.name===`second`){let t=Math.round(i/e.value);return s.format(t,e.name)}}function pe(e){let t=Number(e)||0;return t>=1e6?`${(t/1e6).toFixed(1).replace(/\.0$/,``)}tr`:t>=1e3?`${(t/1e3).toFixed(1).replace(/\.0$/,``)}k`:String(t)}var $=ue();function me({value:e,onChange:t,onSubmit:n}){return(0,$.jsxs)(`form`,{onSubmit:n,className:`\r
        space-y-3\r
        rounded-xl\r
        border\r
        border-border\r
        bg-card\r
        p-4\r
        shadow-sm\r
      `,children:[(0,$.jsx)(K,{value:e,onChange:e=>t(e.target.value),placeholder:`Chia sẻ ý kiến của bạn về bài viết này...`,className:`\r
          min-h-[100px]\r
          resize-none\r
          border-input\r
          bg-background\r
          text-foreground\r
          placeholder:text-muted-foreground\r
          focus-visible:ring-1\r
          focus-visible:ring-ring\r
        `}),(0,$.jsx)(`div`,{className:`flex justify-end`,children:(0,$.jsxs)(V,{type:`submit`,disabled:!e.trim(),className:`gap-2`,children:[(0,$.jsx)(f,{className:`h-4 w-4`}),`Gửi bình luận`]})})]})}function he({filter:e,onChange:t}){return(0,$.jsxs)(`div`,{className:`\r
        flex\r
        w-fit\r
        gap-1\r
        rounded-lg\r
        border\r
        border-border\r
        bg-muted/50\r
        p-1\r
      `,children:[(0,$.jsx)(`button`,{type:`button`,onClick:()=>t(`NEWEST`),className:`
          rounded-md
          px-3
          py-1.5
          text-xs
          font-medium
          transition-all
          ${e===`NEWEST`?`bg-background text-foreground shadow-sm`:`text-muted-foreground hover:text-foreground`}
        `,children:`Mới nhất`}),(0,$.jsx)(`button`,{type:`button`,onClick:()=>t(`MOST_LIKED`),className:`
          rounded-md
          px-3
          py-1.5
          text-xs
          font-medium
          transition-all
          ${e===`MOST_LIKED`?`bg-background text-foreground shadow-sm`:`text-muted-foreground hover:text-foreground`}
        `,children:`Nhiều like nhất`})]})}function ge({reply:e,parentComment:t,liked:n,onLike:r,onReply:i,onReport:o,onDelete:s,user:c}){return(0,$.jsxs)(`div`,{className:`\r
        group\r
        space-y-2\r
        rounded-lg\r
        p-2\r
        -mx-2\r
        transition-colors\r
        hover:bg-muted/40\r
      `,children:[(0,$.jsxs)(`div`,{className:`flex items-center gap-2 min-w-0`,children:[(0,$.jsxs)(G,{className:`h-7 w-7 shrink-0`,children:[(0,$.jsx)(W,{src:e.avatar}),(0,$.jsx)(U,{className:`text-[10px]`,children:e.author?.[0]})]}),(0,$.jsxs)(`div`,{className:`min-w-0 flex flex-wrap items-center gap-1.5`,children:[(0,$.jsx)(`span`,{className:`text-xs font-semibold text-foreground`,children:e.author}),e.authorId===c?.id&&c?.role==`admin`&&(0,$.jsx)(`span`,{className:`\r
                rounded-full\r
                border\r
                border-primary/20\r
                bg-primary/10\r
                px-1.5\r
                py-0.5\r
                text-[9px]\r
                font-semibold\r
                text-primary\r
              `,children:`admin`}),(0,$.jsx)(`span`,{className:`text-[10px] text-muted-foreground`,children:fe(e.createdAt)})]})]}),e.replyToAuthor&&(0,$.jsx)(`div`,{className:`pl-9`,children:(0,$.jsxs)(`button`,{type:`button`,className:`\r
              text-[11px]\r
              text-primary\r
              hover:underline\r
            `,children:[`↳ Trả lời`,` `,(0,$.jsxs)(`span`,{className:`font-semibold`,children:[`@`,e.replyToAuthor]})]})}),(0,$.jsx)(`p`,{className:`\r
          pl-9\r
          text-sm\r
          leading-5\r
          text-foreground/85\r
          whitespace-pre-wrap\r
          break-words\r
        `,children:e.content}),(0,$.jsxs)(`div`,{className:`\r
          flex\r
          items-center\r
          gap-4\r
          pl-9\r
          text-[11px]\r
          text-muted-foreground\r
        `,children:[(0,$.jsxs)(`button`,{type:`button`,onClick:()=>r(e.id,!0,t.id),className:`
            flex
            items-center
            gap-1
            transition-colors
            ${n?`text-destructive`:`hover:text-destructive`}
          `,children:[(0,$.jsx)(y,{className:`h-3 w-3 ${n?`fill-current`:``}`}),e.likes]}),(0,$.jsxs)(`button`,{type:`button`,onClick:()=>i({parentId:t.id,replyToId:e.id,replyToAuthor:e.author}),className:`\r
            flex\r
            items-center\r
            gap-1\r
            hover:text-primary\r
          `,children:[(0,$.jsx)(x,{className:`h-3 w-3`}),`Trả lời`]}),c?.id!==e.authorId&&(0,$.jsxs)(`button`,{type:`button`,onClick:()=>o(e),className:`\r
              flex\r
              items-center\r
              gap-1\r
              hover:text-destructive\r
            `,children:[(0,$.jsx)(g,{className:`h-3 w-3`}),`Report`]}),(0,$.jsx)(q,{do:`update`,on:a(`Comment`,e),children:(0,$.jsxs)(`button`,{type:`button`,className:`\r
              flex\r
              items-center\r
              gap-1\r
              hover:text-primary\r
            `,children:[(0,$.jsx)(u,{className:`h-3.5 w-3.5`}),`Sửa`]})}),(0,$.jsx)(q,{do:`delete`,on:a(`Comment`,e),children:(0,$.jsxs)(`button`,{type:`button`,onClick:()=>s(e.id),className:`\r
              flex\r
              items-center\r
              gap-1\r
              hover:text-destructive\r
            `,children:[(0,$.jsx)(b,{className:`h-3.5 w-3.5`}),`Xóa`]})})]})]})}function _e({replyToAuthor:e,value:t,onChange:n,onSubmit:r,onCancel:i}){return(0,$.jsxs)(`div`,{className:`\r
        ml-8\r
        mt-4\r
        space-y-3\r
        rounded-lg\r
        border\r
        border-border\r
        bg-muted/30\r
        p-3\r
        sm:ml-12\r
      `,children:[(0,$.jsx)(`div`,{className:`flex items-center justify-between gap-3`,children:(0,$.jsxs)(`div`,{className:`text-xs text-muted-foreground`,children:[`Đang trả lời`,` `,(0,$.jsxs)(`span`,{className:`font-semibold text-primary`,children:[`@`,e]})]})}),(0,$.jsx)(K,{autoFocus:!0,value:t,onChange:e=>n(e.target.value),placeholder:`Trả lời @${e}...`,className:`\r
          min-h-[75px]\r
          resize-none\r
          border-input\r
          bg-background\r
          text-foreground\r
          placeholder:text-muted-foreground\r
          focus-visible:ring-1\r
          focus-visible:ring-ring\r
        `}),(0,$.jsxs)(`div`,{className:`flex justify-end gap-2`,children:[(0,$.jsx)(V,{type:`button`,onClick:i,size:`sm`,variant:`ghost`,className:`text-muted-foreground`,children:`Hủy`}),(0,$.jsxs)(V,{type:`button`,onClick:r,disabled:!t.trim(),size:`sm`,className:`gap-1.5`,children:[(0,$.jsx)(x,{className:`h-3.5 w-3.5`}),`Trả lời`]})]})]})}function ve({comment:e,liked:t,expanded:n,replyingTo:r,replyContent:i,user:s,onLike:c,onReply:l,onReport:d,onDelete:f,onToggleReplies:p,onReplyContentChange:m,onSubmitReply:h,onCancelReply:_,editingId:v,editContent:S,onEdit:C,onEditChange:w,onSubmitEdit:T,onCancelEdit:E,isLiked:D}){let O=e.replies??[],k=n?O:O.slice(0,1),A=v===e.id,j=r?.parentId===e.id;return(0,$.jsxs)(`article`,{className:`\r
        rounded-xl\r
        border\r
        border-border\r
        bg-card\r
        p-4\r
        shadow-sm\r
        transition-shadow\r
        hover:shadow-md\r
      `,children:[(0,$.jsx)(`div`,{className:`flex items-start justify-between gap-3`,children:(0,$.jsxs)(`div`,{className:`flex min-w-0 items-center gap-3`,children:[(0,$.jsxs)(G,{className:`h-9 w-9 shrink-0 border border-border`,children:[(0,$.jsx)(W,{src:e.avatar}),(0,$.jsx)(U,{children:e.author?.[0]})]}),(0,$.jsxs)(`div`,{className:`min-w-0`,children:[(0,$.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2`,children:[(0,$.jsx)(`span`,{className:`text-sm font-semibold text-foreground`,children:e.author}),s?.role===`admin`&&s?.id===e.authorId&&(0,$.jsx)(`span`,{className:`\r
                  \r
                    rounded-full\r
                    border\r
                    border-primary/20\r
                    bg-primary/10\r
                    px-2\r
                    py-0.5\r
                    text-[10px]\r
                    font-semibold\r
                    text-primary\r
                  `,children:`admin`})]}),(0,$.jsx)(`span`,{className:`text-[11px] text-muted-foreground`,children:fe(e.createdAt)})]})]})}),A?(0,$.jsxs)(`div`,{className:`space-y-2 pl-12 pt-2`,children:[(0,$.jsx)(K,{autoFocus:!0,value:S,onChange:e=>w(e.target.value),placeholder:`Sửa bình luận...`,className:`\r
              min-h-[75px]\r
              resize-none\r
              border-input\r
              bg-background\r
              text-foreground\r
              placeholder:text-muted-foreground\r
              focus-visible:ring-1\r
              focus-visible:ring-ring\r
            `}),(0,$.jsxs)(`div`,{className:`flex justify-end gap-2`,children:[(0,$.jsx)(V,{type:`button`,size:`sm`,variant:`ghost`,className:`text-muted-foreground`,onClick:E,children:`Hủy`}),(0,$.jsxs)(V,{type:`button`,size:`sm`,onClick:T,disabled:!S.trim(),className:`gap-1.5`,children:[(0,$.jsx)(o,{className:`h-3.5 w-3.5`}),`Lưu`]})]})]}):(0,$.jsx)(`p`,{className:`\r
            pl-12\r
            pt-2\r
            text-sm\r
            leading-6\r
            text-foreground/90\r
            whitespace-pre-wrap\r
            break-words\r
          `,children:e.content}),(0,$.jsxs)(`div`,{className:`\r
          flex\r
          items-center\r
          gap-4\r
          pl-12\r
          pt-3\r
          text-xs\r
          text-muted-foreground\r
        `,children:[(0,$.jsxs)(`button`,{type:`button`,onClick:()=>c(e.id),className:`
            flex
            items-center
            gap-1
            ${t?`text-destructive`:`hover:text-destructive`}
          `,children:[(0,$.jsx)(y,{className:`h-3.5 w-3.5 ${t?`fill-current`:``}`}),e.likes]}),(0,$.jsxs)(`button`,{type:`button`,onClick:()=>l({parentId:e.id,replyToId:e.id,replyToAuthor:e.author}),className:`\r
            flex\r
            items-center\r
            gap-1\r
            hover:text-primary\r
          `,children:[(0,$.jsx)(x,{className:`h-3.5 w-3.5`}),`Trả lời`]}),s&&s.id!==e.authorId&&(0,$.jsxs)(`button`,{type:`button`,onClick:()=>d(e),className:`\r
              flex\r
              items-center\r
              gap-1\r
              hover:text-destructive\r
            `,children:[(0,$.jsx)(g,{className:`h-3.5 w-3.5`}),`Report`]}),(0,$.jsx)(q,{do:`update`,on:a(`Comment`,e),children:(0,$.jsxs)(`button`,{onClick:()=>C(e),type:`button`,className:`\r
              flex\r
              items-center\r
              gap-1\r
              hover:text-primary\r
            `,children:[(0,$.jsx)(u,{className:`h-3.5 w-3.5`}),`Sửa`]})}),(0,$.jsx)(q,{do:`delete`,on:a(`Comment`,e),children:(0,$.jsxs)(`button`,{type:`button`,onClick:()=>f(e.id),className:`\r
              flex\r
              items-center\r
              gap-1\r
              hover:text-destructive\r
            `,children:[(0,$.jsx)(b,{className:`h-3.5 w-3.5`}),`Xóa`]})})]}),j&&(0,$.jsx)(_e,{replyToAuthor:r.replyToAuthor,value:i,onChange:m,onSubmit:h,onCancel:_}),e.replies?.length>0&&(0,$.jsxs)(`div`,{className:`\r
            ml-4\r
            mt-4\r
            border-l-2\r
            border-border\r
            pl-4\r
            sm:ml-8\r
          `,children:[(0,$.jsx)(`div`,{className:`space-y-3`,children:k.map(t=>(0,$.jsx)(ge,{user:s,reply:t,parentComment:e,liked:!!D?.[t.id],onLike:c,onReply:l,onReport:d,onDelete:f},t.id))}),O.length>=2&&(0,$.jsx)(`button`,{type:`button`,onClick:()=>p(e.id),className:`\r
                ml-9\r
                mt-3\r
                text-xs\r
                font-semibold\r
                text-primary\r
                hover:underline\r
              `,children:n?`Thu gọn`:`Xem thêm ${O.length-1} phản hồi`})]})]})}var ye=ae;function be({className:e,...t}){return(0,$.jsx)(ee,{"data-slot":`select-value`,className:Z(`flex flex-1 text-left`,e),...t})}function xe({className:e,size:t=`default`,children:n,...i}){return(0,$.jsxs)(te,{"data-slot":`select-trigger`,"data-size":t,className:Z(`flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,e),...i,children:[n,(0,$.jsx)(le,{render:(0,$.jsx)(r,{className:`pointer-events-none size-4 text-muted-foreground`})})]})}function Se({className:e,children:t,side:n=`bottom`,sideOffset:r=4,align:i=`center`,alignOffset:a=0,alignItemWithTrigger:o=!0,...s}){return(0,$.jsx)(ne,{children:(0,$.jsx)(Y,{side:n,sideOffset:r,align:i,alignOffset:a,alignItemWithTrigger:o,className:`isolate z-50`,children:(0,$.jsxs)(se,{"data-slot":`select-content`,"data-align-trigger":o,className:Z(`relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95`,e),...s,children:[(0,$.jsx)(we,{}),(0,$.jsx)(ie,{children:t}),(0,$.jsx)(Te,{})]})})})}function Ce({className:e,children:t,...n}){return(0,$.jsxs)(J,{"data-slot":`select-item`,className:Z(`relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2`,e),...n,children:[(0,$.jsx)(oe,{className:`flex flex-1 shrink-0 gap-2 whitespace-nowrap`,children:t}),(0,$.jsx)(X,{render:(0,$.jsx)(`span`,{className:`pointer-events-none absolute right-2 flex size-4 items-center justify-center`}),children:(0,$.jsx)(o,{className:`pointer-events-none`})})]})}function we({className:e,...t}){return(0,$.jsx)(ce,{"data-slot":`select-scroll-up-button`,className:Z(`top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4`,e),...t,children:(0,$.jsx)(c,{})})}function Te({className:e,...t}){return(0,$.jsx)(re,{"data-slot":`select-scroll-down-button`,className:Z(`bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4`,e),...t,children:(0,$.jsx)(r,{})})}var Ee=[{value:`Spam / Quảng cáo rác`,label:`Spam / Quảng cáo không liên quan`},{value:`Ngôn từ thù hận / Xúc phạm`,label:`Ngôn từ thù hận / Xúc phạm người khác`},{value:`Thông tin sai sự thật`,label:`Thông tin sai sự thật / Lừa đảo`},{value:`Lý do khác`,label:`Nội dung phản cảm / Lý do khác`}];function De({comment:e,reason:t,success:n,onReasonChange:r,onSubmit:a,onClose:o}){let[s,c]=(0,Q.useState)(!1);return e?(0,$.jsx)(I,{open:!!e,onOpenChange:e=>{e||o()},children:(0,$.jsxs)(N,{className:`sm:max-w-md p-6 rounded-2xl border border-border bg-card text-card-foreground shadow-2xl`,children:[(0,$.jsx)(P,{className:`text-left space-y-1.5 pb-2`,children:(0,$.jsxs)(`div`,{className:`flex items-center gap-2.5`,children:[(0,$.jsx)(`div`,{className:`w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0`,children:(0,$.jsx)(w,{className:`w-5 h-5 text-destructive`})}),(0,$.jsxs)(`div`,{children:[(0,$.jsx)(L,{className:`text-lg font-bold leading-none`,children:`Báo cáo bình luận`}),(0,$.jsx)(R,{className:`text-xs text-muted-foreground mt-1`,children:`Gửi phản ánh tới Ban quản trị để giữ gìn môi trường văn minh.`})]})]})}),n?(0,$.jsxs)(`div`,{className:`py-6 text-center space-y-3`,children:[(0,$.jsx)(`div`,{className:`w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center`,children:(0,$.jsx)(S,{className:`w-7 h-7`})}),(0,$.jsxs)(`div`,{children:[(0,$.jsx)(`p`,{className:`text-base font-semibold text-foreground`,children:`Đã gửi báo cáo thành công!`}),(0,$.jsx)(`p`,{className:`text-xs text-muted-foreground mt-1 max-w-xs mx-auto`,children:`Cảm ơn bạn đã đóng góp. Ban biên tập sẽ kiểm duyệt và xử lý nội dung vi phạm sớm nhất.`})]}),(0,$.jsx)(`div`,{className:`pt-2`,children:(0,$.jsx)(V,{size:`sm`,onClick:o,className:`w-full`,children:`Đóng`})})]}):(0,$.jsxs)(`div`,{className:`space-y-4 pt-1`,children:[(0,$.jsxs)(`div`,{className:`rounded-xl border border-border/80 bg-muted/40 p-3.5 space-y-1`,children:[(0,$.jsxs)(`div`,{className:`flex items-center gap-1.5 text-xs text-muted-foreground font-medium`,children:[(0,$.jsx)(i,{className:`w-3.5 h-3.5`}),(0,$.jsx)(`span`,{children:`Nội dung bị báo cáo:`})]}),(0,$.jsxs)(`p`,{className:`text-sm text-foreground italic line-clamp-3 bg-background/50 p-2 rounded-md border border-border/40`,children:[`"`,e.content,`"`]})]}),(0,$.jsxs)(`div`,{className:`space-y-1.5`,children:[(0,$.jsxs)(`label`,{className:`text-xs font-semibold text-foreground flex items-center gap-1`,children:[(0,$.jsx)(g,{className:`w-3.5 h-3.5 text-destructive`}),` Chọn lý do vi phạm:`]}),(0,$.jsxs)(ye,{value:t,onValueChange:r,children:[(0,$.jsx)(xe,{className:`w-full h-10 border-border`,children:(0,$.jsx)(be,{placeholder:`-- Chọn nguyên nhân phù hợp --`})}),(0,$.jsx)(Se,{className:`border-border`,children:Ee.map(e=>(0,$.jsx)(Ce,{value:e.value,className:`cursor-pointer text-sm`,children:e.label},e.value))})]})]}),(0,$.jsxs)(B,{className:`flex flex-col-reverse sm:flex-row gap-2 pt-2`,children:[(0,$.jsx)(V,{type:`button`,variant:`outline`,onClick:o,className:`w-full sm:w-auto border-border`,children:`Hủy bỏ`}),(0,$.jsx)(V,{type:`button`,variant:`destructive`,onClick:async()=>{c(!0);try{await a()}finally{c(!1)}},disabled:!t||s,className:`w-full sm:w-auto`,children:s?`Đang gửi...`:`Gửi báo cáo vi phạm`})]})]})]})}):null}function Oe(e){let t=e.author||{};return{id:e.id,authorId:t.id||e.authorId,author:t.name||e.authorName||e.author||`Người dùng`,avatar:k(t.avatar||e.authorAvatar||e.avatar),content:e.content||``,likes:Number(e.likesCount??e.likes??0),createdAt:e.createdAt,replies:(e.replies||[]).map(e=>({...Oe(e),replyToId:e.replyToId,replyToAuthor:e.replyToAuthorName||e.replyToAuthor,parentId:e.parentId})),replyToId:e.replyToId,replyToAuthor:e.replyToAuthorName||e.replyToAuthor}}function ke({article:e}){let{user:t}=F(),n=z(),[r,a]=(0,Q.useState)([]),[o,s]=(0,Q.useState)(!0),[c,l]=(0,Q.useState)(`NEWEST`),{addToast:u}=M(),d=(0,Q.useCallback)(async()=>{try{let t=await A.get(`/articles/${e.id}/comments?page=1&limit=50&sort=${c===`MOST_LIKED`?`most_liked`:`newest`}`);a((t?.data?.items||[]).map(Oe))}catch(e){u(e.message||`Không tải được bình luận`,`error`)}finally{s(!1)}},[e.id,c,u]);(0,Q.useEffect)(()=>{d()},[d]);let[f,p]=(0,Q.useState)(``),[m,h]=(0,Q.useState)(null),[g,_]=(0,Q.useState)(``),[v,y]=(0,Q.useState)(null),[b,x]=(0,Q.useState)(``),[S,C]=(0,Q.useState)({}),[w,T]=(0,Q.useState)({}),[E,D]=(0,Q.useState)(null),[O,k]=(0,Q.useState)(``),[j,N]=(0,Q.useState)(!1),P=async r=>{if(r.preventDefault(),!t)return n();let i=f.trim();if(i)try{await A.post(`/articles/${e.id}/comments`,{content:i}),p(``),await d(),u(`Đã gửi bình luận`)}catch(e){u(e.message||`Không gửi được bình luận`,`error`)}},I=({parentId:e,replyToId:r,replyToAuthor:i})=>{t?(h({parentId:e,replyToId:r,replyToAuthor:i}),_(``),y(null),T(t=>({...t,[e]:!0}))):n()},L=()=>{h(null),_(``)},R=async()=>{if(!t||!m)return;let n=g.trim();if(n)try{await A.post(`/articles/${e.id}/comments`,{content:n,parentId:Number(m.parentId),replyToId:Number(m.replyToId||m.parentId)}),T(e=>({...e,[m.parentId]:!0})),L(),await d(),u(`Đã gửi phản hồi`)}catch(e){u(e.message||`Không gửi được phản hồi`,`error`)}},B=e=>{y(e.id),x(e.content),h(null)},V=()=>{y(null),x(``)},H=async()=>{let e=b.trim();if(e&&v)try{await A.patch(`/comments/${v}`,{content:e}),V(),await d(),u(`Đã cập nhật bình luận`)}catch(e){u(e.message||`Không cập nhật được bình luận`,`error`)}},U=async(e,r=!1,i=null)=>{if(!t)return n();let o=!!S[e];try{o?await A.delete(`/comments/${e}/like`):await A.post(`/comments/${e}/like`,{}),C(t=>({...t,[e]:!o})),a(t=>t.map(t=>!r&&t.id===e?{...t,likes:Math.max(0,t.likes+(o?-1:1))}:r&&t.id===i?{...t,replies:t.replies.map(t=>t.id===e?{...t,likes:Math.max(0,t.likes+(o?-1:1))}:t)}:t))}catch(e){u(e.message||`Không thể cập nhật lượt thích`,`error`)}},W=e=>{T(t=>({...t,[e]:!t[e]}))},G=e=>{D(e),k(``),N(!1)},K=()=>{D(null),k(``),N(!1)},q=async()=>{if(!t)return n();if(!O||!E)return;let e={"Spam / Quảng cáo rác":`SPAM`,"Ngôn từ thù hận / Xúc phạm":`HATE_SPEECH`,"Thông tin sai sự thật":`FAKE_NEWS`,"Lý do khác":`OTHER`};try{await A.post(`/comments/${E.id}/reports`,{reason:e[O]||`OTHER`,...O===`Lý do khác`?{note:`Người dùng báo cáo nội dung khác`}:{}}),N(!0)}catch(e){u(e.message||`Không gửi được báo cáo`,`error`)}},J=async e=>{try{await A.delete(`/comments/${e}`),v===e&&V(),await d(),u(`Đã xóa bình luận`)}catch(e){u(e.message||`Không xóa được bình luận`,`error`)}},Y=[...r].sort((e,t)=>c===`MOST_LIKED`?t.likes-e.likes:new Date(t.createdAt)-new Date(e.createdAt));return(0,$.jsxs)(`section`,{className:`space-y-6 border-t border-border pt-6`,children:[(0,$.jsxs)(`div`,{className:`
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        `,children:[(0,$.jsxs)(`h3`,{className:`
            flex
            items-center
            gap-2
            text-xl
            font-bold
            tracking-tight
            text-foreground
          `,children:[(0,$.jsx)(i,{className:`h-5 w-5 text-primary`}),`Bình luận (`,r.length,`)`]}),(0,$.jsx)(he,{filter:c,onChange:l})]}),(0,$.jsx)(me,{value:f,onChange:p,onSubmit:P}),(0,$.jsxs)(`div`,{className:`space-y-4`,children:[o&&(0,$.jsx)(`p`,{className:`py-4 text-center text-sm text-muted-foreground`,children:`Đang tải bình luận…`}),!o&&Y.length===0&&(0,$.jsx)(`p`,{className:`rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground`,children:`Chưa có bình luận. Hãy là người đầu tiên chia sẻ ý kiến.`}),Y.map(e=>(0,$.jsx)(ve,{user:t,comment:e,liked:!!S[e.id],expanded:!!w[e.id],replyingTo:m,replyContent:g,onLike:U,onReply:I,onReport:G,onDelete:J,onToggleReplies:W,onReplyContentChange:_,onSubmitReply:R,onCancelReply:L,editingId:v,editContent:b,onEdit:B,onEditChange:x,onSubmitEdit:H,onCancelEdit:V,isLiked:S},e.id)),Y.length===0&&(0,$.jsxs)(`div`,{className:`
              rounded-xl
              border
              border-dashed
              border-border
              bg-muted/30
              p-10
              text-center
            `,children:[(0,$.jsx)(i,{className:`mx-auto mb-3 h-8 w-8 text-muted-foreground`}),(0,$.jsx)(`p`,{className:`text-sm font-medium text-foreground`,children:`Chưa có bình luận nào`}),(0,$.jsx)(`p`,{className:`mt-1 text-xs text-muted-foreground`,children:`Hãy là người đầu tiên chia sẻ ý kiến.`})]})]}),(0,$.jsx)(De,{comment:E,reason:O,success:j,onReasonChange:k,onSubmit:q,onClose:K})]})}function Ae(){let{id:e}=T(),{user:r}=F(),[i,a]=(0,Q.useState)(null),[c,u]=(0,Q.useState)(null),[f,g]=(0,Q.useState)(``),[b,x]=(0,Q.useState)(0),[S,C]=(0,Q.useState)(!1),[w,k]=(0,Q.useState)(!1),{addToast:N}=M();(0,Q.useEffect)(()=>{let t=!0;return A.get(`/articles/${encodeURIComponent(e)}`).then(n=>{if(!t)return;let r=j(n?.data||{});a(r),g(``),u(e),x(Number(r.likesCount||0)),C(!!r.isLiked),k(!!r.isBookmarked),A.post(`/articles/${encodeURIComponent(e)}/view`,{}).catch(()=>{})}).catch(n=>{t&&(g(n.message||`Không tải được bài viết.`),u(e))}),()=>{t=!1}},[e]);let[P,I]=(0,Q.useState)(`text-base`),[L,R]=(0,Q.useState)(!1),B=z(),[K,q]=(0,Q.useState)(0);if((0,Q.useEffect)(()=>{let e=null,t=()=>{e===null&&(e=requestAnimationFrame(()=>{let t=document.documentElement.scrollHeight-window.innerHeight;if(t>0){let e=window.scrollY/t*100;q(Math.min(100,Math.max(0,e)))}e=null}))};return window.addEventListener(`scroll`,t,{passive:!0}),()=>{window.removeEventListener(`scroll`,t),e!==null&&cancelAnimationFrame(e)}},[]),c!==e)return(0,$.jsx)(D,{children:(0,$.jsx)(`div`,{className:`mx-auto max-w-4xl py-16 text-center text-muted-foreground`,children:`Đang tải bài viết…`})});if(!i)return f?(0,$.jsx)(D,{children:(0,$.jsxs)(`div`,{className:`mx-auto max-w-3xl rounded-xl border border-border p-10 text-center`,children:[(0,$.jsx)(`h1`,{className:`text-xl font-bold`,children:`Không thể mở bài viết`}),(0,$.jsx)(`p`,{className:`mt-2 text-sm text-muted-foreground`,children:f}),(0,$.jsx)(E,{className:`mt-4 inline-block text-primary hover:underline`,to:`/`,children:`Quay về trang chủ`})]})}):(0,$.jsx)(de,{});let J=async()=>{if(!r)return B();try{S?await A.delete(`/articles/${i.id}/like`):await A.post(`/articles/${i.id}/like`,{}),C(!S),x(e=>Math.max(0,e+(S?-1:1)))}catch(e){N(e.message||`Không thể cập nhật lượt thích`,`error`)}},Y=()=>{navigator.clipboard&&(navigator.clipboard.writeText(window.location.href),R(!0),setTimeout(()=>R(!1),2e3))},ee=i.related||[],te=i.popular||[],X=r&&(r.role===`admin`||Number(r.id)===Number(i.authorId));return(0,$.jsxs)(D,{children:[(0,$.jsx)(`div`,{className:`fixed top-0 left-0 w-full h-1 bg-transparent z-50`,children:(0,$.jsx)(`div`,{className:`h-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 transition-all duration-150`,style:{width:`${K}%`}})}),(0,$.jsxs)(`div`,{className:`space-y-6`,children:[(0,$.jsxs)(`nav`,{className:`flex items-center gap-2 text-xs text-muted-foreground font-medium flex-wrap`,children:[(0,$.jsxs)(E,{to:`/`,className:`flex items-center gap-1 hover:text-foreground transition-colors`,children:[(0,$.jsx)(v,{className:`w-3.5 h-3.5`}),(0,$.jsx)(`span`,{children:`Trang chủ`})]}),(0,$.jsx)(l,{className:`w-3.5 h-3.5`}),(0,$.jsx)(E,{to:`/category/${i.categorySlug||`tin-tuc`}`,className:`hover:text-foreground transition-colors`,children:i.category}),(0,$.jsx)(l,{className:`w-3.5 h-3.5`}),(0,$.jsx)(`span`,{className:`text-foreground truncate max-w-[280px] md:max-w-md font-semibold`,children:i.title})]}),(0,$.jsxs)(`div`,{className:`grid grid-cols-1 lg:grid-cols-3 gap-8`,children:[(0,$.jsxs)(`div`,{className:`lg:col-span-2 space-y-6`,children:[(0,$.jsxs)(`div`,{className:`space-y-4`,children:[(0,$.jsxs)(`div`,{className:`flex items-center justify-between gap-3`,children:[(0,$.jsx)(E,{to:`/category/${i.categorySlug||`tin-tuc`}`,children:(0,$.jsx)(H,{className:`bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-xs`,children:i.category})}),X&&(0,$.jsx)(E,{to:`/author/edit/${i.id}`,children:(0,$.jsxs)(V,{variant:`outline`,size:`xs`,className:`gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10`,children:[(0,$.jsx)(_,{className:`w-3 h-3`}),` Chỉnh sửa bài`]})})]}),(0,$.jsx)(`h1`,{className:`text-2xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight`,children:i.title}),(0,$.jsx)(`p`,{className:`text-base md:text-lg text-muted-foreground font-medium italic border-l-4 border-primary pl-4 py-1 leading-relaxed`,children:i.excerpt}),(0,$.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between border-y border-border py-3.5 gap-4 text-sm text-muted-foreground`,children:[(0,$.jsxs)(E,{to:`/author-profile/${i.authorId||101}`,className:`flex items-center gap-3 group cursor-pointer`,children:[(0,$.jsxs)(G,{className:`w-10 h-10 border border-border group-hover:border-primary transition-colors`,children:[(0,$.jsx)(W,{src:i.authorAvatar||`https://github.com/shadcn.png`}),(0,$.jsx)(U,{children:i.author?.[0]||`A`})]}),(0,$.jsxs)(`div`,{children:[(0,$.jsx)(`p`,{className:`font-semibold text-foreground group-hover:text-primary transition-colors`,children:i.author}),(0,$.jsx)(`p`,{className:`text-xs text-muted-foreground`,children:i.publishedAt})]})]}),(0,$.jsxs)(`div`,{className:`flex items-center gap-4 text-xs`,children:[(0,$.jsxs)(`span`,{className:`flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full`,children:[(0,$.jsx)(n,{className:`w-3.5 h-3.5 text-primary`}),` `,i.readingTime||`3 phút đọc`]}),(0,$.jsxs)(`span`,{className:`flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full`,children:[(0,$.jsx)(d,{className:`w-3.5 h-3.5 text-primary`}),` `,pe(i.views),` lượt xem`]})]})]})]}),(0,$.jsxs)(`div`,{className:`flex items-center justify-between bg-card border border-border p-3 rounded-xl shadow-2xs`,children:[(0,$.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,$.jsxs)(V,{variant:S?`default`:`outline`,size:`sm`,onClick:J,className:`gap-1.5 cursor-pointer ${S?`bg-red-600 hover:bg-red-700 text-white`:`border-border text-foreground hover:bg-muted`}`,children:[(0,$.jsx)(y,{className:`w-4 h-4 ${S?`fill-white text-white`:``}`}),(0,$.jsx)(`span`,{children:b})]}),(0,$.jsxs)(V,{variant:w?`default`:`outline`,size:`sm`,onClick:async()=>{if(!r)return B();try{w?await A.delete(`/articles/${i.id}/bookmark`):await A.post(`/articles/${i.id}/bookmark`,{}),k(!w)}catch(e){N(e.message||`Không thể cập nhật bài đã lưu`,`error`)}},className:`gap-1.5 cursor-pointer ${w?`bg-primary text-primary-foreground`:`border-border text-foreground hover:bg-muted`}`,children:[(0,$.jsx)(p,{className:`w-4 h-4 ${w?`fill-current`:``}`}),(0,$.jsx)(`span`,{children:w?`Đã lưu`:`Lưu bài`})]}),(0,$.jsxs)(V,{variant:`outline`,size:`sm`,onClick:Y,className:`gap-1.5 border-border text-foreground hover:bg-muted cursor-pointer`,children:[L?(0,$.jsx)(o,{className:`w-4 h-4 text-emerald-500`}):(0,$.jsx)(t,{className:`w-4 h-4`}),(0,$.jsx)(`span`,{children:L?`Đã copy`:`Chia sẻ`})]})]}),(0,$.jsxs)(`div`,{className:`flex items-center gap-1 bg-muted p-1 rounded-lg`,children:[(0,$.jsx)(V,{variant:`ghost`,size:`icon`,className:`h-7 w-7 cursor-pointer ${P===`text-sm`?`bg-background text-foreground shadow-2xs font-bold`:`text-muted-foreground`}`,onClick:()=>I(`text-sm`),title:`Thu nhỏ chữ`,children:(0,$.jsx)(m,{className:`w-3.5 h-3.5`})}),(0,$.jsx)(V,{variant:`ghost`,size:`icon`,className:`h-7 w-7 text-xs font-bold cursor-pointer ${P===`text-base`?`bg-background text-foreground shadow-2xs`:`text-muted-foreground`}`,onClick:()=>I(`text-base`),title:`Cỡ chữ mặc định`,children:`A`}),(0,$.jsx)(V,{variant:`ghost`,size:`icon`,className:`h-7 w-7 cursor-pointer ${P===`text-lg`?`bg-background text-foreground shadow-2xs font-bold`:`text-muted-foreground`}`,onClick:()=>I(`text-lg`),title:`Phóng to chữ`,children:(0,$.jsx)(h,{className:`w-3.5 h-3.5`})})]})]}),(0,$.jsx)(`div`,{className:`rounded-xl overflow-hidden border border-border shadow-xs bg-muted`,children:(0,$.jsx)(`img`,{src:i.image,alt:i.title,width:1200,height:460,decoding:`async`,className:`w-full max-h-[460px] object-cover`})}),(0,$.jsx)(`div`,{className:`prose dark:prose-invert max-w-none space-y-4 text-foreground leading-relaxed ${P}`,dangerouslySetInnerHTML:{__html:s.sanitize(i.content||`<p>Nội dung bài viết đang được cập nhật...</p>`)}}),i.tags&&i.tags.length>0&&(0,$.jsxs)(`div`,{className:`flex items-center gap-2 pt-4 border-t border-border flex-wrap`,children:[(0,$.jsx)(`span`,{className:`text-xs text-muted-foreground font-semibold`,children:`Từ khóa:`}),i.tags.map(e=>(0,$.jsx)(E,{to:`/tag/${String(e).toLowerCase().replace(/\s+/g,`-`)}`,children:(0,$.jsxs)(H,{variant:`secondary`,className:`hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer text-xs`,children:[`#`,e]})},e))]}),(0,$.jsx)(`div`,{className:`pt-8 border-t border-border`,children:(0,$.jsx)(ke,{article:i},i.id)})]}),(0,$.jsxs)(`div`,{className:`space-y-6`,children:[(0,$.jsxs)(`div`,{className:`bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs`,children:[(0,$.jsxs)(`h3`,{className:`font-bold text-base text-foreground border-b border-border pb-3 flex items-center gap-2`,children:[(0,$.jsx)(`span`,{className:`w-2 h-4 bg-red-500 rounded-full`}),`Đọc nhiều nhất`]}),(0,$.jsx)(`div`,{className:`space-y-4`,children:te.map((e,t)=>(0,$.jsxs)(E,{to:`/article/${e.slug||e.id}`,className:`flex gap-3 group cursor-pointer`,children:[(0,$.jsxs)(`span`,{className:`text-2xl font-black text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0`,children:[`0`,t+1]}),(0,$.jsxs)(`div`,{className:`space-y-1`,children:[(0,$.jsx)(`h4`,{className:`text-xs font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug`,children:e.title}),(0,$.jsxs)(`span`,{className:`text-[11px] text-muted-foreground`,children:[pe(e.views),` lượt xem`]})]})]},e.id))})]}),(0,$.jsxs)(`div`,{className:`space-y-4`,children:[(0,$.jsxs)(`h3`,{className:`font-bold text-base text-foreground flex items-center gap-2`,children:[(0,$.jsx)(`span`,{className:`w-2 h-4 bg-primary rounded-full`}),`Bài viết liên quan`]}),(0,$.jsx)(`div`,{className:`space-y-4`,children:ee.map(e=>(0,$.jsx)(O,{article:e},e.id))})]})]})]})]})]})}export{Ae as default};