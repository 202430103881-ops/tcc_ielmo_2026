const STORAGE_KEY = 'denunciasEscolares';
const LAST_REPORT_KEY = 'ultimaDenuncia';
function readReports(){try{return JSON.parse(sessionStorage.getItem(STORAGE_KEY)||'[]')}catch{return []}}

const form=document.getElementById('reportForm');
if(form){
  const fileInput=document.getElementById('midia');
  fileInput.addEventListener('change',()=>document.getElementById('fileName').textContent=fileInput.files[0]?`Arquivo selecionado: ${fileInput.files[0].name}`:'');
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const data=new FormData(form), now=new Date();
    const report={
      protocolo:`ESC-${now.getFullYear()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
      tipo:data.get('tipo')||'',local:data.get('local')||'',data:data.get('data')||'',
      hora:data.get('hora')||'',descricao:data.get('descricao')||'',
      arquivo:fileInput.files[0]?.name||'',enviadoEm:now.toISOString(),status:'Aguardando análise'
    };
    try{
      const reports=readReports();reports.unshift(report);
      sessionStorage.setItem(STORAGE_KEY,JSON.stringify(reports));
      sessionStorage.setItem(LAST_REPORT_KEY,JSON.stringify(report));
      location.href='sucesso.html';
    }catch(error){document.getElementById('formMessage').textContent='Não foi possível guardar o relato nesta sessão. Tente novamente.';console.error(error)}
  });
}

const list=document.getElementById('reportsList');
if(list){
  const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date=value=>{if(!value)return 'Não informado';const [y,m,d]=value.split('-');return `${d}/${m}/${y}`};
  function render(){
    const reports=readReports();
    document.getElementById('totalReports').textContent=reports.length;
    document.getElementById('openReports').textContent=reports.filter(r=>r.status==='Aguardando análise').length;
    if(!reports.length){list.innerHTML='<div class="empty"><strong>Nenhuma denúncia registrada</strong><p>Quando um relato for enviado, ele aparecerá aqui.</p></div>';return}
    list.innerHTML=reports.map(r=>`<article class="report-card"><div class="report-head"><div><b>${safe(r.tipo)}</b><small>${safe(r.protocolo)}</small></div><span class="status">${safe(r.status)}</span></div><p><b>Local:</b> ${safe(r.local||'Não informado')}</p><p><b>Data:</b> ${safe(date(r.data))} ${safe(r.hora)}</p><p><b>Descrição:</b> ${safe(r.descricao||'Não informada')}</p>${r.arquivo?`<p><b>Arquivo selecionado:</b> ${safe(r.arquivo)}</p>`:''}<small>Recebida em ${new Date(r.enviadoEm).toLocaleString('pt-BR')}</small></article>`).join('');
  }
  document.getElementById('clearReports').addEventListener('click',()=>{
    if(confirm('Tem certeza de que deseja apagar todos os registros desta sessão?')){sessionStorage.removeItem(STORAGE_KEY);sessionStorage.removeItem(LAST_REPORT_KEY);render()}
  });
  render();
}
