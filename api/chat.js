export default async function handler(req) {
    if(req.method !== "POST"){
        return Response.json({success:false,msg:"只支持POST请求"},{status:405})
    }
    const { userPrompt } = await req.json()
    const apiKey = process.env.DEEPSEEK_APIKEY;
    if(!apiKey){
        return Response.json({success:false,msg:"Vercel后台没有配置APIKEY环境变量"},{status:500})
    }
    const resp = await fetch("https://api.deepseek.com/v1/chat/completions",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model:"deepseek-chat",
            messages:[
                {role:"system",content:"你是提示词专家，根据用户需求，生成一段专业、详细、高质量的AI提示词，直接输出提示词，不要多余解释"},
                {role:"user",content:userPrompt}
            ],
            temperature:0.7
        })
    })
    const json = await resp.json();
    if(json.choices?.[0]){
        return Response.json({success:true, content: json.choices[0].message.content})
    }else{
        return Response.json({success:false, msg: JSON.stringify(json)})
    }
}
