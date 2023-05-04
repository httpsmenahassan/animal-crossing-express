const heart = document.querySelector('.fa-heart')

heart.addEventListener('click', function () {

  fetch('villager', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // sending two things to the server
      // villagerId and heart.id are the same thing
      // we want to send a boolean -- true means you want to like, false means you want to unlike -- based on whether or not the heart contains fa-regular or fa-solid
      villagerId: heart.id,
      like: heart.classList.contains('fa-regular')

    })
  })
    .then(response => {
      if (response.ok) return response.json()
    })
    .then(data => {
      console.log(data)
      window.location.reload(true)
    })
});

