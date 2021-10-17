
///graf zupanije
{   // fetch("https://www.koronavirus.hr/json/?action=po_danima_zupanijama")
    let zupanije = [];
    let najveci_broj_zarazenih = 0;
    let naziv_zupanije = "";
    let podaci = [];
    let vrsta_podataka = "broj_aktivni";
    let trenutna_zupanija = 0;
    const canvas= document.getElementById("graf");

canvas.width = "630";
canvas.height = "300";
const ctx = canvas.getContext("2d");

    const map_nazivi = new Map ([
      ["broj_aktivni","active"],
      ["broj_umrlih","death"],
      ["broj_zarazenih","infected"]
    ]);
    const prikaz_naslov_graf = document.querySelector(".chart h3");
    const selekcija_zupanija = document.querySelector("#dashbord aside>nav>ul>li:last-child");
 
    document.querySelectorAll('input[name="izbor_graf"]').forEach(x=>{
    x.addEventListener("change",e=>{
    
      vrsta_podataka=e.currentTarget.value;
      odabir_zupanije(trenutna_zupanija)
    })


  })

  canvas.addEventListener("mousemove",e=>{
 

    requestAnimationFrame(()=> crtaj(podaci,ctx,transform_window_cordinate_to_canvas(e)));
    
    
    })
    
    
  
 const podaci_promise= fetch("./JAVASCRIPT/korona31.json")
       .then(x=>x.json())
      .then(x=>{
     
      zupanije = [...x[0].PodaciDetaljno.map((x,i)=>{
           return{
             index:i,
             zupanija:x.Zupanija
           }
         })];
       
         const select = document.createElement("select");
         zupanije.forEach(x=>{
           const option =  document.createElement("option");
           option.value = x.index;
           option.textContent = x.zupanija;
           select.appendChild(option);

         })
         select.addEventListener('change',e=>{
          trenutna_zupanija =e.target.value;
           odabir_zupanije(trenutna_zupanija);
         })
   
      selekcija_zupanija.appendChild(select);
         return x;
        })
    .catch(x=>console.log(x));




    //////odabir zupaije 
  function odabir_zupanije (ind){
return   podaci_promise
         .then(x=>{
          const obrada_za_zupaniju = zupanije[ind]
         naziv_zupanije =  obrada_za_zupaniju.zupanija;
          const podaci = [];
        
          for (let i = 0;i<x.length;i++){
            let po = x[i];
              let ob = {};
              ob.datum = po.Datum;

      
              ob.aktivni = po.PodaciDetaljno[obrada_za_zupaniju.index][vrsta_podataka];
              podaci.push(ob);
          };


          najveci_broj_zarazenih= podaci.reduce((ak,val)=>{
              return val.aktivni>ak?ak=val.aktivni:ak
          },0);
         
          return podaci;

      })
      .then(x=>{
      
      return   x.sort((a,b)=>new Date(b.datum)- new Date(a.datum));
       })
       
       .then(x=>{
       //  console.log(x);
          podaci = [...x];
    
    window.requestAnimationFrame(()=>crtaj(podaci,ctx));
   

       })
            
       .catch(x=>console.log(x));

      }
    



///promjea koordinata 
function transform_window_cordinate_to_canvas(e){
  let can= e.target;
let rec_objec =can.getBoundingClientRect();

const clientX =(e.clientX-rec_objec.left)*(can.width/rec_objec.width);
const clientY = (e.clientY-rec_objec.top)*(can.height/rec_objec.height);


   return {
     clientX, clientY
   }
}






    



      /////////////////////////////////////////CRTAJ/////////////
      function crtaj (podaci,ctx,e=""){

      const tockice = "3"; //visina i sirina prikaznog kvadratica
      const skala_y = canvas.height*0.9;
      const skala_x= canvas.width*0.9;
      const pomak_x = canvas.width*0.1;
      const max_vrijednst_y = najveci_broj_zarazenih || 1370;
      let faktor_skaliranja_x = 1;
      const label_x_os = "datum"; 
      const label_x_os_prva_vrijenost = new Date (podaci[podaci.length-1].datum).toLocaleDateString();
      const label_x_os_srednja_vrijenost = new Date (podaci[Math.ceil((podaci.length-1)/2)*faktor_skaliranja_x].datum).toLocaleDateString();
     
      const label_x_os_zadnja_vrijenost = new Date (podaci[0].datum).toLocaleDateString();
      const faktor_skaliranja_y = (skala_y/max_vrijednst_y)*0.95.toFixed(1);
     ( podaci.length<skala_x )? faktor_skaliranja_x = 1:  faktor_skaliranja_x = ((skala_x/podaci.length)*0.98).toFixed(2);

   
   ctx.resetTransform();

 ctx.clearRect(0, 0, canvas.width, canvas.height);

ctx.transform(1,0,0,1,pomak_x,skala_y);
ctx.fillStyle = "white";
ctx.strokeStyle = "white";
// x y os
ctx.beginPath();
ctx.lineWidth = "1";
ctx.setLineDash([]);
ctx.moveTo(0,tockice); // x os
ctx.lineTo(canvas.width,tockice); // x os
ctx.moveTo(0,tockice); // y os
ctx.lineTo(tockice,-skala_y);   // y os

ctx.stroke();




// crtanje grafa ////////
          for(let i=1;i<podaci.length; i++){
        

          ctx.fillRect(i*faktor_skaliranja_x,-podaci[podaci.length-i].aktivni*faktor_skaliranja_y,tockice,tockice);

        } 
      
ctx.beginPath();
ctx.font = "12px Ariel";
       ctx.setLineDash([1, 2]);
    //    ctx.setLineDash([]);
     //   ctx.lineDashOffset =4;
        ctx.lineWidth = 0.3;
  ctx.fillText(label_x_os_prva_vrijenost,0,20) ;  // x skala vrijednosri
  ctx.moveTo(0,0);  
  ctx.lineTo(0,10);

 

  ctx.fillText(label_x_os_zadnja_vrijenost,skala_x*faktor_skaliranja_x-45,20); // x zadnja vrijednost
  ctx.moveTo((podaci.length-1)*faktor_skaliranja_x,0);  
  ctx.lineTo((podaci.length-1)*faktor_skaliranja_x,7);

  ctx.fillText("0",-10,0); // y os vrijednost prva
 

  
  ctx.fillText(500,-25,-500*faktor_skaliranja_y+3); // y vrijednost srednja
  ctx.moveTo(0,-500*faktor_skaliranja_y);  
  ctx.lineTo(skala_x,-500*faktor_skaliranja_y);

  ctx.fillText(1000,-25,-1000*faktor_skaliranja_y+3); // y vrijednost 1000
  ctx.moveTo(0,-1000*faktor_skaliranja_y);  
  ctx.lineTo(skala_x,-1000*faktor_skaliranja_y);
  ctx.fillText(max_vrijednst_y,-25,-max_vrijednst_y*faktor_skaliranja_y+3); // y max vrijednost
  ctx.moveTo(0,-max_vrijednst_y*faktor_skaliranja_y);  
  ctx.lineTo(7,-max_vrijednst_y*faktor_skaliranja_y);
 
//obrada mosemove

ctx.fillText(label_x_os_srednja_vrijenost,Math.ceil((podaci.length-1)/2)*faktor_skaliranja_x-30,20); // x srednja vrijednost
  ctx.moveTo(Math.ceil((podaci.length-1)/2)*faktor_skaliranja_x,0);  
  ctx.lineTo(Math.ceil((podaci.length-1)/2)*faktor_skaliranja_x,7);
//obrada mosemove

ctx.resetTransform();

// crtanje linije
ctx.moveTo(e.clientX,0);
// console.log(e.clientX,pomak_x);
if(e.clientX>pomak_x)ctx.lineTo(e.clientX,skala_y+parseInt( tockice)); 
 // Draw a line to (150, 100)
ctx.stroke();    

// podaci za prikazivanje
const pozija_text_x = canvas.width*0.12;
ctx.font = "18px Ariel";


prikaz_naslov_graf.textContent =  naziv_zupanije+" " +map_nazivi.get(vrsta_podataka);

const pod = parseInt((e.clientX-pomak_x)/faktor_skaliranja_x);


const obj = (podaci[podaci.length-pod]);

let datum = "";
let aktivni="";

if(!obj)return;

datum = new Date( obj.datum).toLocaleDateString();

aktivni=map_nazivi.get(vrsta_podataka)+": " +obj.aktivni;




// podaci za graf 
const prikaz_visina = 80;
const prikaz_sirina = 140;
const zakrivljenje = 5  ;
ctx.beginPath();



const y_pomak = skala_y -(obj.aktivni*faktor_skaliranja_y)>skala_y-prikaz_visina?skala_y-prikaz_visina:skala_y -(obj.aktivni*faktor_skaliranja_y);

e.clientX-prikaz_sirina<pomak_x?ctx.transform(1,0,0,1,e.clientX+10,y_pomak)
:ctx.transform(1,0,0,1,e.clientX-10-prikaz_sirina,y_pomak);

ctx.lineWidth = "1";
ctx.setLineDash([]);


ctx.stroke();

// prikaz podataka kvadratic

ctx.beginPath();
ctx.moveTo(zakrivljenje,0);
ctx.arcTo(prikaz_sirina,0,prikaz_sirina,prikaz_visina,zakrivljenje );
ctx.arcTo(prikaz_sirina,prikaz_visina ,0,prikaz_visina,zakrivljenje );
ctx.arcTo(0,prikaz_visina,0,0,zakrivljenje );
ctx.arcTo(0,0,prikaz_sirina,0,zakrivljenje );
ctx.fillStyle="#393939";
ctx.globalAlpha="0.9";
ctx.fill();
ctx.globalAlpha="1";
ctx.fillStyle="white";



ctx.fillText(datum,5,30);
ctx.fillText(aktivni,5,60);
ctx.stroke();

 
      }
      ////////////////////////////////crtaj kraj////////////////////////////
      
// media
   
   /*   
        const graf = document.getElementById("graf");
   
        const mql = window.matchMedia('(max-width:40em)');
        mql.addEventListener('change',e=>{
          console.log('mql',e);
          if(e.matches){
            
canvas.width = "500";
canvas.height = "280";

window.requestAnimationFrame(()=>crtaj(podaci,ctx));
          }else{
                          
canvas.width = "630";

canvas.height = "300";
window.requestAnimationFrame(()=>crtaj(podaci,ctx));
          }
        })
        
*/
  //inicijalizacija
  odabir_zupanije(trenutna_zupanija);
    }

    
{
  // skriva hash
  window.addEventListener('hashchange', function() {

const uri = window.location.toString();

history.replaceState("","",uri.split('#')[0]);


});
}
