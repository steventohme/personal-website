
import './Intro.css'
// import me from '../../Images/me.png'
export default function IntroText(){
    return (
        <div>
            <img src={'me.png'} className='me-img'/>
            <div className='intro-title'>
                Why, hello there! I’m Steven. 
            </div>
            
            <div className='intro-text'>
                I’m a self-proclaimed minesweeper master. I’m 
                just beginning my journey in tech and am excited to get my feet wet. 
                Click around to find out more about me!
            </div>
        </div>

    )
}