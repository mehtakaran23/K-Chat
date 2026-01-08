const socket = io();
console.log("Welcome to K-Chat");
//get dom elements in respective js variables
const form = document.getElementById('send-container');
const messageInput=document.getElementById('messageinput');
const messageContainer=document.querySelector(".container");

//audio that will play on receiving messages
var audio = new Audio('/assets/ringtone.mp3');
let audioUnlocked = false;

//unlock audio on first user interaction
function unlockAudio() {
    if (audioUnlocked) return;

    audio.play()
        .then(() => {
            audio.pause();
            audio.currentTime = 0;
            audioUnlocked = true;
            console.log("🔊 Audio unlocked");
        })
        .catch(() => {});
}

// unlock on first user interaction
document.addEventListener('click', unlockAudio, { once: true });
document.addEventListener('keydown', unlockAudio, { once: true });


//function which will append event info to the container
const append = (message,position)=>{
    const messageElement = document.createElement('div');
    messageElement.innerHTML=message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    if (audioUnlocked && position=='left') {
    audio.currentTime = 0;
    audio.play();
}

}

//for timestamp
function getTime() {
    const now = new Date();
    return now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}


//ask new user for his/her name and let the server know
const name = prompt("Enter your name to join K-Chat");
socket.emit('new-user-joined',name);

//if a new user joins, receive his/her name from the server
socket.on('user-joined',name=>{
     append(`${name} joined the chat`,`right`)
})


//if a user leaves the chat, append the info to the container
socket.on('left',name=>{
    append(`${name} left the chat`,`right`)
})


//for appending messages with timestamp
socket.on('receive', data => {
    if (data.name === name) return; // 🔥 ignore own message

    append(
        `<strong>${data.name}</strong>: ${data.message}
         <span class="time">${getTime()}</span>`,
        'left'
    );
});



//if form gets submitted, send server the message
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;

    append(
        `<strong>You</strong>: ${message}
         <span class="time">${getTime()}</span>`,
        'right'
    );

    socket.emit('send', message);
    messageInput.value = '';
});



