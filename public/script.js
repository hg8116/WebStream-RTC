const socket = io("/")
const videoGrid = document.getElementById("video-grid")
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
})
const myVideo = document.createElement("video")
myVideo.muted = true
const peers = {}

navigator.mediaDevices
  .getUserMedia({
    video: userType !== "spectator" ? true : false,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream)

    myPeer.on("call", (call) => {
      call.answer(stream)
      const video = document.createElement("video")
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream)
      })
    })

    socket.on("user-connected", (userId, userType) => {
      if (userType === "spectator") {
        // connectSpectatorToNewUser(userId, stream)
        console.log("User is a spectator. Camera is not connected.")
      } else {
        connectToNewUser(userId, stream)
      }
    })
  })

// navigator.mediaDevices
//   .getUserMedia({
//     video: userType !== "spectator", // Allow video only for non-spectators
//     audio: true,
//   })
//   .then((stream) => {
//     addVideoStream(myVideo, stream)

//     myPeer.on("call", (call) => {
//       call.answer(stream)
//       const video = document.createElement("video")
//       call.on("stream", (userVideoStream) => {
//         addVideoStream(video, userVideoStream)
//       })
//     })

//     socket.on("user-connected", (userId, userType) => {
//       if (userType !== "spectator") {
//         // Handle regular user logic.
//         connectToNewUser(userId, stream)
//       }
//     })
//   })

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) {
    peers[userId].close()
    removeVideoStream(userId)
  }
})

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement("video")
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream)
  })
  call.on("close", () => {
    video.remove()
  })

  peers[userId] = call
}

// function connectSpecToNewUser(userId, stream) {
//   const call = myPeer.call(userId, stream)
//   const video = document.createElement("video")
//   call.on("stream", (userVideoStream) => {
//     addVideoStream(video, userVideoStream)
//   })
//   call.on("close", () => {
//     video.remove()
//   })

//   peers[userId] = call
// }

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener("loadedmetadata", () => {
    video.play()
  })
  videoGrid.append(video)
}

function removeVideoStream(userId) {
  const videoElement = document.getElementById(userId)
  if (videoElement) {
    videoElement.remove()
  }
}
