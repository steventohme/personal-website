
import './Intro.css'

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

            </div>
            <div className='preface-text'>
                This site is still under construction, in the meantime, feel free to visit
                my social media pages or view my resume to learn more about me.
            </div>
        </div>

    )
}