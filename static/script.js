
document.addEventListener('DOMContentLoaded', function() {
    
    let room = localStorage.getItem('room');
    let newRoom
    
    

    const username =  localStorage.getItem('username');
    document.querySelector('#user').innerHTML = "Hello" + " " + username + "!";



    document.querySelector('#submit').disabled = true;

    document.querySelector('#nuevoMensaje').onkeyup  = () => {
        if (document.querySelector('#nuevoMensaje').value.length > 0)
            document.querySelector('#submit').disabled = false;
        else
            document.querySelector('#submit').disabled = true;

    };








    var socket = io.connect('http://127.0.0.1:5000');

    joinRoom(room);

    document.querySelector('#formulario').onsubmit = () => {
        const msg = document.querySelector('#nuevoMensaje').value;
        socket.emit('enviar mensaje', {'msg': msg, 'username':username, 'room':room});
        document.querySelector('#nuevoMensaje').value = '';
        return false;
        
    };





    socket.on('message', data => {
        const li = document.createElement('li');
        li.innerHTML =` <p id="name">${data["username"]}</p> <p id="msg"> ${data["msg"]}</p> <p id="hora">${data["timestamp"]}</p> `;
        document.querySelector('#messages').append(li);

        

    });

   
 //channel

   document.querySelector('#channelform').onsubmit = () => { 
    const room = document.querySelector('#nuevoChannel').value;
       socket.emit('crear channel', {'room' : room});
       document.querySelector('#nuevoChannel').value ='';
       return false;
   };
   


    socket.on('anunciar channel', data => {
        const li = document.createElement('li');
        li.className = "lista"
        li.setAttribute("id", "eachchannel")
        li.innerHTML =  `${data.room}`;
        document.querySelector('#channelList').append(li);
        console.log(data.room)


        document.querySelectorAll('#eachchannel').forEach(li => {
            li.onclick = () => {
                let newRoom=li.innerHTML
                document.querySelector('#newchannel').innerHTML = "Channel:" + li.innerHTML;
                console.log(newRoom)
                leaveRoom(room)
                joinRoom(newRoom)
                localStorage.setItem('room', newRoom);
                window.location.href = `http://127.0.0.1:5000/chat/${newRoom}`;
                console.log(room)
                

                
            }
        
        }); 
    }); 


    document.querySelectorAll('#eachchannel').forEach(li => {
        li.onclick = () => {
            let newRoom=li.innerHTML
            document.querySelector('#newchannel').innerHTML = "Channel:" + li.innerHTML;
            console.log(newRoom)
            leaveRoom(room)
            joinRoom(newRoom)
            localStorage.setItem('room', newRoom);
            window.location.href = `http://127.0.0.1:5000/chat/${newRoom}`;
            console.log(room)
            
            
        }
    
    }); 


    function leaveRoom(room) {
        socket.emit('leave', {'username': username, 'room': room});

    }
    function joinRoom(room) {

        // Join room
        socket.emit('join', {'username': username, 'room': room});
    }
   

}); 







   