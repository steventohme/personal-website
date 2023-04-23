
import React from "react";

import { Center, Grid, ActionIcon } from "@mantine/core";
import { AiFillInstagram, AiFillGithub, AiFillLinkedin, AiFillFileText} from "react-icons/ai";

export default function SocialMediaButtons(){
    
    return (
        <Center style={{height:'108.33vw'}}>
            <Grid justify="center" align="center" grow>
                <Grid.Col span={1}>
                    <a href="https://github.com/steventohme" target="_blank" rel="external noreferrer">
                        <ActionIcon size="xl" color="dark">
                            <AiFillGithub size={100} />
                        </ActionIcon>
                    </a>
                </Grid.Col>

                <Grid.Col span={1}>
                    <a href="https://linkedin.com/in/steven-tohme" target="_blank" rel="external noreferrer">
                        <ActionIcon size="xl" color="dark">
                            <AiFillLinkedin size={100} />
                        </ActionIcon>
                    </a>
                </Grid.Col>

                <Grid.Col span={1}>
                    <a href="/sample-resume.pdf" target="_blank" >
                        <ActionIcon size="xl" color="dark">
                            <AiFillFileText size={100} />
                        </ActionIcon>
                    </a>
                </Grid.Col>

                <Grid.Col span={1}>
                    <a href="https://www.instagram.com/stevenlikessandwiches/" target="_blank" rel="external noreferrer">
                        <ActionIcon size="xl" color="dark">
                            <AiFillInstagram size={100} />
                        </ActionIcon>
                    </a>
                </Grid.Col>

                <Grid.Col span={1}>
                    <a href="https://letterboxd.com/bagellover/" target="_blank" rel="external noreferrer">
                        <ActionIcon size="xl" color="dark">
                            <img src={"/letterboxd.svg"} style={{height: 38, width: 38}}/>
                        </ActionIcon>
                    </a>
                </Grid.Col>

            
            </Grid>
        </Center>
    );
};

