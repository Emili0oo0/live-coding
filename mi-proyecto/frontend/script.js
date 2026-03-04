let token = "";
let carritoArray = [];

/* ================= UI según login ================= */
function actualizarUI() {
  const logeado = token !== "";

  // Secciones privadas
  document.getElementById("seccionCrearProducto").classList.toggle("d-none", !logeado);
  document.getElementById("seccionMisProductos").classList.toggle("d-none", !logeado);
  document.getElementById("seccionCatalogo").classList.toggle("d-none", !logeado);
  document.getElementById("seccionCarrito").classList.toggle("d-none", !logeado);
  document.getElementById("btnLogout").classList.toggle("d-none", !logeado);

  // Registro/Login
  document.getElementById("seccionLoginRegistro").classList.toggle("d-none", logeado);
}

/* ================= REGISTER ================= */
async function register() {
  const emailValue = rEmail.value.trim(), passwordValue = rPass.value.trim(), confirmValue = rPass2.value.trim();
  if(!emailValue||!passwordValue||!confirmValue){ alert("Todos los campos son obligatorios"); return; }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!emailRegex.test(emailValue)){ alert("Email inválido"); return; }
  if(passwordValue!==confirmValue){ alert("Passwords no coinciden"); return; }
  try{
    const res = await fetch("http://localhost:3000/api/auth/register",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:emailValue,password:passwordValue,confirmPassword:confirmValue})});
    const data = await res.json(); if(res.ok){ alert("Registrado correctamente"); } else alert("Error: "+data.error);
  }catch{ alert("Error en la conexión al servidor"); }
}

/* ================= LOGIN ================= */
async function login(){
  const emailValue = lEmail.value.trim(), passwordValue = lPass.value.trim();
  if(!emailValue||!passwordValue){ alert("Todos los campos son obligatorios"); return; }
  try{
    const res = await fetch("http://localhost:3000/api/auth/login",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:emailValue,password:passwordValue})});
    const data = await res.json();
    if(res.ok){ 
      token=data.token; 
      actualizarUI(); // 🔑 Aquí actualizamos la UI para ocultar login/registro
      alert("Login OK"); 
    } else alert("Error: "+data.error);
  }catch{ alert("Error en la conexión al servidor"); }
}

/* ================= LOGOUT ================= */
function logout(){
  token=""; carritoArray=[]; renderCarrito(); actualizarUI(); alert("Has cerrado sesión");
}

/* ================= CREAR PRODUCTO ================= */
async function crear(){
  if(token===""){ alert("Debes iniciar sesión"); return; }
  const nombreValue=nombre.value.trim(), descValue=desc.value.trim(), precioValue=Number(precio.value);
  if(!nombreValue||!descValue||precioValue<=0){ alert("Datos inválidos"); return; }
  try{
    const res = await fetch("http://localhost:3000/api/products",{ method:"POST", headers:{"Content-Type":"application/json","Authorization":"Bearer "+token}, body:JSON.stringify({nombre:nombreValue,descripcion:descValue,precio:precioValue})});
    if(res.ok){ alert("Producto creado"); cargarMisProductos(); } else { const data = await res.json(); alert("Error: "+data.error);}
  }catch{ alert("Error en la conexión al servidor"); }
}

/* ================= MIS PRODUCTOS ================= */
async function cargarMisProductos(){
  if(token===""){ alert("Debes iniciar sesión"); return; }
  try{
    const res = await fetch("http://localhost:3000/api/products/mine",{ headers:{"Authorization":"Bearer "+token}});
    if(!res.ok){ alert("Error cargando productos"); return; }
    const productos = await res.json();
    misProductos.innerHTML="";
    productos.forEach(p=>{
      const li=document.createElement("li");
      li.className="list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML=`${p.nombre} - ${p.precio} €
      <div>
        <button class="btn btn-sm btn-danger me-1" onclick="borrar(${p.id})"><i class="bi bi-trash"></i></button>
        <button class="btn btn-sm btn-success" onclick="agregarCarrito(${p.id},'${p.nombre}',${p.precio})"><i class="bi bi-cart-plus"></i></button>
      </div>`;
      misProductos.appendChild(li);
    });
  }catch{ alert("Error en la conexión al servidor"); }
}

/* ================= BORRAR ================= */
async function borrar(id){
  if(token===""){ alert("Debes iniciar sesión"); return; }
  try{ 
    const res=await fetch(`http://localhost:3000/api/products/${id}`,{ method:"DELETE", headers:{"Authorization":"Bearer "+token} }); 
    if(res.ok){ alert("Producto eliminado"); cargarMisProductos(); } 
    else { const data=await res.json(); alert("Error: "+data.error); }
  }catch{ alert("Error en la conexión al servidor"); }
}

/* ================= CATALOGO ================= */
async function cargarCatalogo(){
  if(token===""){ alert("Debes iniciar sesión"); return; }
  try{
    const res = await fetch("http://localhost:3000/api/products",{ headers:{"Authorization":"Bearer "+token}});
    if(!res.ok){ alert("Error cargando catálogo"); return; }
    const productos = await res.json();
    catalogo.innerHTML="";
    productos.forEach(p=>{
      const div=document.createElement("div");
      div.className="col-md-4";
      div.innerHTML=`<div class="card h-100">
        <div class="card-body d-flex flex-column justify-content-between">
          <h5 class="card-title">${p.nombre}</h5>
          <p class="card-text">${p.descripcion}</p>
          <p class="card-text fw-bold">${p.precio} €</p>
          <button class="btn btn-success" onclick="agregarCarrito(${p.id},'${p.nombre}',${p.precio})"><i class="bi bi-cart-plus"></i> Añadir al carrito</button>
        </div></div>`;
      catalogo.appendChild(div);
    });
  }catch{ alert("Error en la conexión al servidor"); }
}

/* ================= CARRITO ================= */
function agregarCarrito(id,nombre,precio){ if(token===""){ alert("Debes iniciar sesión"); return; } carritoArray.push({id,nombre,precio}); renderCarrito(); }
function renderCarrito(){ carrito.innerHTML=""; let total=0; carritoArray.forEach((item,i)=>{ total+=item.precio; const li=document.createElement("li"); li.className="list-group-item d-flex justify-content-between align-items-center"; li.innerHTML=`${item.nombre} - ${item.precio} € <button class="btn btn-sm btn-danger" onclick="quitarCarrito(${i})"><i class="bi bi-trash"></i></button>`; carrito.appendChild(li); }); totalCarrito.innerText="Total: "+total+" €"; }
function quitarCarrito(index){ carritoArray.splice(index,1); renderCarrito(); }
function finalizarCompra(){ 
  if(token===""){ alert("Debes iniciar sesión"); return; } 
  if(carritoArray.length===0){ alert("Carrito vacío"); return; }
  alert("Compra simulada completada"); carritoArray=[]; renderCarrito();
}

// Inicializar UI
actualizarUI();