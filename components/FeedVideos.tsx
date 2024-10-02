import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { ResizeMode, Video } from "expo-av";
import Colors from "@/constants/Colors";

const videos = [
  {
    newId: "1",
    id: "1",
    uri: "https://res.cloudinary.com/dovypt3mt/video/upload/v1727257187/Porsche_911_ST_.._allez_voir_les_superbes_cre%CC%81ations_de_Trevor_Johnston_trevvvy_porsche_reels_porsche911st_gddpfd.mp4",
  },
  {
    newId: "2",
    id: "2",
    uri: "https://res.cloudinary.com/dovypt3mt/video/upload/v1727257086/Let_me_show_you_underneath_on_911_GT3RS_._gt3rs_992gt3rs_911gt3rs_katujt.mp4",
  },
  {
    id: "3",
    newId: "3",
    uri: "https://res.cloudinary.com/dovypt3mt/video/upload/v1727310316/Sidepods_over-wheel_winglets_18_wheels_and_wider_tires_the_2022_car_is_certainly_eyecatching._Are_you_ready_for_some_Australian_racing_today_qswn7j.mp4",
  },
  {
    newId: "4",
    id: "4",
    uri: "https://res.cloudinary.com/dovypt3mt/video/upload/v1727310318/With_an_Australian-sourced_Ford_Cleveland_351ci_V8_this_limited-edition_1985_De_Tomaso_Pantera_GT5_rocked_the_auction_block_selling_for_220_000_in_Palm_Beach_..._BarrettJackson_BJAC_BarrettJacksonPalmBeach_PB24_PalmBeachAuction_Clas_leet5x.mp4",
  },
  {
    newId: "4",
    id: "5",
    uri: "https://res.cloudinary.com/dovypt3mt/video/upload/v1727310330/Last_hand-built_Mercedes_First_S-Class_W111_with_V8_fully_Restored_motorclassichungary_mercedes_classic_sclass_v8_w111_280SE_classiccars_convertible_restoration_coupe_design_xhhc3h.mp4",
  },
  {
    newId: "5",
    id: "6",
    uri: "https://res.cloudinary.com/dovypt3mt/video/upload/v1727256802/Certainly_not_a_car_you_see_everyday_rarecars_ferrari_rareferrari_ferrari500_italian_italiancars_sportscars_classiccars_qyhbbc.mp4",
  },
  {
    newId: "6",
    id: "7",
    uri: "https://res.cloudinary.com/dovypt3mt/video/upload/v1727310335/Totally_original_and_unrestored_Australian_Delivered_1972_Ferrari_Dino_246_GT_with_Daytona_Option_seats._Amazing_how_well_this_car_has_survived._SOLD_ferrari_dino_246gt_modena_alfredino_rossocorsa_f40_classiccars_original_collect_gwxa4r.mp4",
  },

  {
    newId: "7",
    id: "8",
    uri: "https://res.cloudinary.com/dovypt3mt/video/upload/v1727310325/Das_teuerste_DUO_in_ganz_fosgoodwood_car_cars_supercar_supercars_classiccars_mercedes_mercedesbenz_carlifestyle_supercarlifestyle_exoticcars_goodwood_mercedesamg_amg_dreamcar_carporn_carshow_carculture_luxurycars_tynqva.mp4",
  },
  {
    newId: "8",
    id: "9",
    uri: "https://res.cloudinary.com/dovypt3mt/video/upload/v1727310316/Join_Us_on_Australia_s_Ultimate_Road_Trip_50_Supercars100_participantsTrack_DayAirport_Drag_RacingLuxury_accommodation_VIP_entertainment._Don_t_Miss_Out_nmmmmx.mp4",
  },
  {
    newId: "8",
    id: "10",
    uri: "https://res.cloudinary.com/dovypt3mt/video/upload/v1727310330/Todays_Killer_Cars_Reel._Picardy_Red_HK_Monaro_at_Highball_in_the_Mall_in_Heidelberg._Great_example_with_amazing_body_paint._Holden_HK_Monaro_GTS_327_Bathurst_PicardyRed_AussieMuscle_Iconic_Australian_Muscle_MuscleCars_Class_mxboam.mp4",
  },
  {
    newId: "10",
    id: "11",
    uri: "https://res.cloudinary.com/dovypt3mt/video/upload/v1727310316/Picasso_with_a_steering_wheel_harrismonkey_at_work_._Follow_gentlemendrivers_official_..._porsche_porsche911_porschemoment_porscheclub_porschelife_chrisharris_porsche911gt3_porsche911gt3rs_gt3rs_cars_classiccar_vintageca_pkvcue.mp4",
  },
  {
    newId: "11",
    id: "12",
    uri: "https://res.cloudinary.com/dovypt3mt/video/upload/v1727310337/After_the_1978_Australian_Grand_Prix_at_Sandown_Raceway_Juan_Manuel_Fangio_in_his_1954_Mercedes-Benz_W196_and_Jack_Brabham_in_his_1966_Brabham_BT19_had_a_spirited_three-lap_demonstration..._or_rather_a_full-on_race._Fangio_stated_that_he_acevpp.mp4",
  },
  {
    id: "13",
    uri: "https://res.cloudinary.com/dovypt3mt/video/upload/v1727310318/oldtimer_classiccars_classiccar_vintagecar_youngtimer_vintage_car_cars_oldschool_carsofinstagram_s_w_classic_oldcar_vintagecars_porsche_mercedes_e_carspotting_bmw_instacar_retro_retrocar_carphotography_auto_carporn_lpecva.mp4",
  },
  {
    id: "14",
    uri: "https://res.cloudinary.com/dovypt3mt/video/upload/v1727310317/When_there_s_a_call_out_for_a_Land_Rover_for_an_upcoming_South_Australian_project_who_else_but_axlecomechanical_.._landrover_classiccars_outbackaustralia_zx9zvu.mp4",
  },
];

const FullScreenVideoList = () => {
  const [visibleIndex, setVisibleIndex] = useState(0);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      setVisibleIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View>
      <FlatList
        data={videos}
        renderItem={({ item, index }) => (
          <Post post={{ ...item, isPlaying: visibleIndex === index }} />
        )}
        showsVerticalScrollIndicator={false}
        snapToInterval={Dimensions.get("window").height - 130}
        snapToAlignment={"start"}
        decelerationRate={"fast"}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const Post = (props: { post: { uri: string; id: string; isPlaying: boolean } }) => {
  const [isPlaying, setPlaying] = useState(props.post.isPlaying);
  const [loading, setLoading] = useState(true);

  const onPlayPausePress = () => {
    setPlaying((prev) => !prev);
  };

  useEffect(() => {
    setLoading(true);
    setPlaying(props.post.isPlaying);
  }, [props.post.isPlaying]);

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={onPlayPausePress}>
        <View>
          {loading && (
            <ActivityIndicator
              size="large"
              color={Colors.primary}
              style={{ position: "absolute", top: 0, zIndex: 2, left: 0, right: 0 }}
            />
          )}
          <Video
            source={{ uri: props.post.uri }}
            style={styles.video}
            onError={(e) => console.log(e)}
            resizeMode={ResizeMode.COVER}
            shouldPlay={isPlaying}
            isLooping
            useNativeControls={false}
            onLoadStart={() => setLoading(true)}
            onLoad={() => setLoading(false)}
            onPlaybackStatusUpdate={(status) => {
              if (loading && status.isLoaded) {
                setLoading(false);
              }
            }}
          />
          <View style={styles.uiContainer}></View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: Dimensions.get("window").height - 130,
  },

  video: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  uiContainer: {
    height: "100%",
    justifyContent: "flex-end",
  },
});

export default FullScreenVideoList;
