
document.addEventListener('DOMContentLoaded', function() {
    
    let room = localStorage.getItem('room');
    let newRoom

    /* Location(); */


    const username =  localStorage.getItem('username');
    
    
    document.querySelector('#newchannel').innerHTML =  localStorage.getItem('room') + " channel";



    document.querySelector('#submit').disabled = true;

    document.querySelector('#nuevoMensaje').onkeyup  = () => {
        if (document.querySelector('#nuevoMensaje').value.length > 0)
            document.querySelector('#submit').disabled = false;
        else
            document.querySelector('#submit').disabled = true;

    };
    



    var socket = io.connect('http://127.0.0.1:5000');

    joinRoom(room);
    


    //Send message


    document.querySelector('#formulario').onsubmit = () => {
        const msg = document.querySelector('#nuevoMensaje').value;
        socket.emit('enviar mensaje', {'msg': msg, 'username':username, 'room':room});
        document.querySelector('#nuevoMensaje').value ='';
        return false;
        
    };

    //Announce message

    socket.on('message', data => {
        const li = document.createElement('li');
        li.setAttribute("class", "text-center")
        if (data["username"] == "Anuncio"){
            li.setAttribute("id", "Anuncio")
            li.innerHTML =`  <p id="msg"> ${data["msg"]}</p> `;
        }
        else{
            li.setAttribute("id", "mensaje")
            li.setAttribute("class", "text-center d-flex flex-column")
            li.innerHTML =` <p id="name">${data["username"]}</p> <p id="msg">${data["msg"]}</p> <p id="hora">${data["timestamp"]}</p> `;
            const hide = document.createElement('button')
            if (data["username"] == username){
                hide.className = 'hide btn'
                hide.innerHTML = '&#10008;'
                li.prepend(hide);
            }

            //Creating hide element to dinamically created messages, and deleting them onclick

            hide.onclick = function() {
                this.parentElement.remove();
                var parrafo = this.parentElement
                console.log(parrafo)
                parrafo.remove();
                const msg = parrafo.children[2].innerHTML
                const timestamp = parrafo.children[3].innerHTML 
                socket.emit('borrar', {"timestamp": timestamp, "msg": msg, "username": username, "room":room}); 
            };

        }

        document.querySelector('#messages').append(li);
        scrollDownChatWindow();
        document.querySelector("#nuevoMensaje").focus();

        

    });

   
    //Create channel

   document.querySelector('#channelform').onsubmit = () => { 
    const room = document.querySelector('#nuevoChannel').value;
       socket.emit('crear channel', {'room' : room});
       document.querySelector('#nuevoChannel').value ='';
       return false;
   };
   

   //Announce channel

    socket.on('anunciar channel', data => {
        if (data["room"] == "Room already exist"){
            
            alert("Room already exist")

        } 
        else {
            const li = document.createElement('li');
            li.className = "lista"
            li.setAttribute("id", "eachchannel")
            li.innerHTML =  `${data.room}`;
            document.querySelector('#channelList').append(li);
            
        }

        
        //Redirect to that channel onclick (for dynamically created channels)

        document.querySelectorAll('#eachchannel').forEach(li => {
            li.onclick = () => {
                let newRoom=li.innerHTML
                console.log(newRoom)
                leaveRoom(room)
                localStorage.setItem('room', newRoom);
                window.location.href = `http://127.0.0.1:5000/chat/${newRoom}`;
                console.log(room)
                document.querySelector("#nuevoMensaje").focus();

                
            }
        
        }); 
    }); 

    //Redirect to  channel onclick (for channels displayed with jinja)

    document.querySelectorAll('#eachchannel').forEach(li => {
        li.onclick = () => {
            let newRoom=li.innerHTML
            document.querySelector('#newchannel').innerHTML = "Channel:" + li.innerHTML;
            console.log(newRoom)
            leaveRoom(room)
            localStorage.setItem('room', newRoom);
            window.location.href = `http://127.0.0.1:5000/chat/${newRoom}`;
            console.log(room)
            document.querySelector("#nuevoMensaje").focus();
            
        }
    
    }); 


    
    //Creating hide element, and removing message onclick

    
        document.querySelectorAll('#name').forEach(p =>{    
            var nombre = p.innerHTML
            if(nombre == username ){
                console.log("igual")
                const hide = document.createElement('button')
                hide.className = 'hide btn'
                hide.innerHTML = '&#10008;'
                p.prepend(hide);
                hide.onclick = function() {
                    var parrafo = this.parentElement
                    var msj = parrafo.parentElement
                    msj.remove();
                    const msg = msj.children[1].innerHTML
                    const timestamp = msj.children[2].innerHTML

                    socket.emit('borrar', {"timestamp": timestamp, "msg": msg, "username": nombre, "room":room}); 

                };
            } 
                    
        });

    //Announce deleted message

    socket.on('anunciar borrar', data => {
        console.log("borrado")
        document.querySelectorAll('#mensaje').forEach(li => {
            if (data["username"] != username){
                console.log(li.children[2].innerHTML)
                time = li.children[2]
                console.log(time)
                if(data["timestamp"]==time.innerHTML){
                    var borrar = time.parentElement
                    borrar.remove();
                    socket.emit('enviar mensaje', {'msg': data["username"] +" Deleted a message", 'username': "Anuncio", 'room':room});
                    
                }
            }

                
        });


    });
 
 
    //Functions

    function leaveRoom(room) {
        socket.emit('leave', {'username': username, 'room': room});

    }
    function joinRoom(room) {

        // Join room
        socket.emit('join', {'username': username, 'room': room});
    }


    function scrollDownChatWindow() {
        const chatWindow = document.querySelector("#messages");
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

}); 







   