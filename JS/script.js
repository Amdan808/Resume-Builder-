function enableEdit(str) {
    const $name = document.getElementById(str);
    const $input = document.createElement('input');
    
    
    $name.addEventListener('click', e => {
        $name.textContent = ''
        $name.prepend($input);
        $input.focus()
        
    $input.addEventListener('keydown', e => {
        if (e.key ==='Enter') {
            $name.textContent = $input.value
            $input.remove()
        }
    })    
        
    })
}
enableEdit('name')