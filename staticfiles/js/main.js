console.log('UBU Lite React placeholder script loaded');
document.addEventListener('DOMContentLoaded', function(){
	const btns = document.querySelectorAll('a.btn');
	btns.forEach(b=> b.addEventListener('click', ()=> console.log('placeholder action')));
});