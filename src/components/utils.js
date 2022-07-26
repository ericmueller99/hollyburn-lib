import React from "@types/react";

export function LoadingWidget({isLoading = false}) {
    return (
        <div className={isLoading ? 'block' : 'hidden'}>
            <div className={"w-full h-full bg-hbLightGray absolute top-0 left-0 opacity-60 z-40"}></div>
            <div className={"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"} style={{zIndex: 400}}>
                <img src="/images/loading.gif" height="150px" width="150px" alt="Loading..." />
            </div>
        </div>
    )
}