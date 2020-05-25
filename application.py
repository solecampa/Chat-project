import os

from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
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
        session['user'] = username
   
        if username not in usernames:
            usernames.append(username)
        

        return redirect(url_for('chat'))    
    return render_template('index.html')

@app.route("/chat/General" , methods=["POST", "GET"]) 
def chat():   
    mensajes=channels["General"]
    return render_template('chat.html',  usernames=usernames, channels=channels, mensajes=mensajes)




@socketio.on('crear channel')
def crear_channel(data):
    room = data['room']
    if room not in channels:
        channels[room] = []
        emit("anunciar channel", {'room': room},  broadcast=True) 

        
        
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
    username = "Joining"
    joining = data["username"]
    room = data["room"]
    join_room(room)
    timestamp = time.asctime( time.localtime( time.time() ) )
    # Broadcast that new user has joined
    send({"msg": joining + " has joined the " + room + " room.", "username":username, "timestamp":timestamp }, room=room)


@socketio.on('leave')
def on_leave(data):
    """User leaves a room"""
    username = "Leaving"
    leaving = data["username"]
    timestamp = time.asctime( time.localtime( time.time() ) )
    room = data["room"]
    leave_room(room)
    send({"msg": leaving + " has left the " + room + " room.", "username":username, "timestamp":timestamp }, room=room) 

@app.route("/chat/<string:room>" , methods=["POST", "GET"]) 
def chatroom(room):

    mensajes=channels[room]   
    
    return render_template('chat.html',  usernames=usernames, channels=channels, mensajes=mensajes)

    
 








if __name__ == "__main__":
    socketio.run(app)

