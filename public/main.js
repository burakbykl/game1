document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    let currentRegion = null;
  
    document.querySelectorAll('.region').forEach(region => {
      region.addEventListener('click', () => {
        currentRegion = region.id;
        socket.emit('getQuestion', { regionId: currentRegion });
      });
    });
  
    socket.on('question', (data) => {
      document.getElementById('questionText').textContent = data.question;
      document.getElementById('questionModal').style.display = 'block';
      document.getElementById('modalOverlay').style.display = 'block';
    });
  
    socket.on('regionClaimed', (data) => {
      const regionId = data.regionId;
      const owner = data.owner;
  
      const regionElement = document.getElementById(regionId);
      regionElement.style.backgroundColor = owner === socket.id ? 'lightgreen' : 'red'; // Differentiate claimed regions
      regionElement.style.pointerEvents = 'none'; // Disable clicking on claimed regions
    });
  
    socket.on('alreadyClaimed', () => {
      alert('This region is already claimed!');
    });
  
    socket.on('wrongAnswer', () => {
      alert('Wrong answer!');
    });
  
    document.getElementById('submitAnswerButton').addEventListener('click', submitAnswer);
  
    document.getElementById('answerInput').addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        submitAnswer();
      }
    });
  
    document.getElementById('modalOverlay').addEventListener('click', () => {
      document.getElementById('questionModal').style.display = 'none';
      document.getElementById('modalOverlay').style.display = 'none';
    });
  
    function submitAnswer() {
      const answer = document.getElementById('answerInput').value;
      socket.emit('claimRegion', { regionId: currentRegion, answer });
      document.getElementById('questionModal').style.display = 'none';
      document.getElementById('modalOverlay').style.display = 'none';
      document.getElementById('answerInput').value = '';
    }
  });
  
  