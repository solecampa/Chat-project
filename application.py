import os

from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_session import Session
from flask_socketio import SocketIO, join_room, leave_room, send, emit
import requests, time, datetime



app = Flask(__name__)
app.config["SECRET_KEY"] = "my secret key"
socketio = SocketIO(app)


channels = {}
usernames = []
channels["General"] = []

print(channels)







@app.route("/" , methods=["POST", "GET"])
def index():
    if request.method=="POST":
        username = request.form.get("name")
        session["username"] = username
        if username not in usernames:
            usernames.append(username)
            print(usernames)
            return redirect(url_for('chat')) 
        else:
            print("ya exite")
            flash("Username already exist, pick another one") 
            return render_template('index.html')
    else:
        if "username" in session:
            if "room" in session:
                return redirect(url_for('chatroom', room=session["room"] ))    
            return redirect(url_for('chat'))  
        return render_template('index.html')

@app.route("/chat/General" , methods=["POST", "GET"]) 
def chat():
    username = session["username"]   
    mensajes=channels["General"]
    room = session.get('room')
    if len(mensajes) == 100:
        del mensajes[0] 
    return render_template('chat.html', username=username, usernames=usernames, channels=channels, mensajes=mensajes)


@app.route("/logout/")
def logout():
    username = session["username"]
    session.pop("username")
    x = usernames.index(username)
    usernames.pop(x)

    return redirect(url_for('index'))


@socketio.on('crear channel')
def crear_channel(data):
    room = data['room']
    if room not in channels:
        channels[room] = []
        emit("anunciar channel", {'room': room},  broadcast=True)
    else:
        emit("anunciar channel", {'room': "Room already exist"},)



@socketio.on('borrar')
def borrar(data):
    print("borrar")
    timestamp = data["timestamp"]
    msg = data["msg"]
    room = data["room"]
    username = data["username"]
    MensajeBorrado = {"timestamp": timestamp, "msg": msg, "username": username}
    mensajes = channels[room]
    x = mensajes.index(MensajeBorrado)
    del mensajes[x]    #elimine el msj de la lista de mensajes
    print(channels)

    emit("anunciar borrar", {"timestamp": timestamp, "msg": msg, "username": username}, room=room,  broadcast=True) 

        
        
@socketio.on('enviar mensaje')
def send_msg(data):
    username = data["username"]
    msg = data["msg"]
    timestamp = time.asctime( time.localtime( time.time() ) )
    room = data["room"]
    mensaje = {"timestamp": timestamp, "msg": msg, "username": username}
    channels[room].append(mensaje)

    print(channels)

    send(mensaje, room=room )


@socketio.on('join')
def on_join(data):
    """User joins a room"""
    username = "Anuncio"
    joining = data["username"]
    room = data["room"]
    join_room(room)
    timestamp = time.asctime( time.localtime( time.time() ) )
    # Broadcast that new user has joined
    send({"msg": joining + " has joined " + room , "username":username, "timestamp":timestamp }, room=room)


@socketio.on('leave')
def on_leave(data):
    """User leaves a room"""
    username = "Anuncio"
    leaving = data["username"]
    timestamp = time.asctime( time.localtime( time.time() ) )
    room = data["room"]
    leave_room(room)
    send({"msg": leaving + " has left the " + room , "username":username, "timestamp":timestamp }, room=room) 

@app.route("/chat/<string:room>" , methods=["POST", "GET"]) 
def chatroom(room):
    if request.method=="GET":
        session['room'] = room
        mensajes=channels[room]
        username = session["username"]
        if len(mensajes) == 100:
            del mensajes[0]  
        return render_template('chat.html', usernames=usernames, channels=channels, mensajes=mensajes, username=username)

    
 








if __name__ == "__main__":
    socketio.run(app)

