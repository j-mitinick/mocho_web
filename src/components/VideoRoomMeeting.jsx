import AgoraUIKit from "agora-react-uikit";

export const VideoRoomMeeting = ({channel,appId,onTornOffCall})=>{
    const rtcProps = {
        appId,
        channel,
        token:null
    }

    const callbacks = {
        EndCall:()=>{
            onTornOffCall()
        }
    };


    return( 
        <AgoraUIKit 
        
            rtcProps={rtcProps} 
            callbacks={callbacks}
            styleProps={
                {
                    localBtnContainer:
                        {
                            backgroundColor:'transparent',justifyContent:'center',
                            height:'fit-content'
                        },
                    BtnTemplateStyles:{
                        backgroundColor:'#3890a2'                            
                    }
                    
                }
            }
        />
    )
  
}