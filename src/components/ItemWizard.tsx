import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { FileUpload } from "./FileUpload";

interface ItemFormData {
  title: string;
  imageId: Id<"_storage"> | null;
  genres: string[];
  description: string;
  director: string;
  cast: string[];
  premiereYear: number | null;
  runningTime: number | null;
  country: string;
  rating: number | null;
  posterImageUrl: string;
  videoSources: Array<{
    url: string;
    quality: string;
    type: string;
  }>;
  captions: Array<{
    label: string;
    srcLang: string;
    src: string;
    default?: boolean;
  }>;
}

interface ItemWizardProps {
  categoryId: Id<"categories">;
  editingItem?: Id<"items"> | null;
  initialData?: Partial<ItemFormData>;
  onClose: () => void;
  onSuccess: () => void;
}

export function ItemWizard({ categoryId, editingItem, initialData, onClose, onSuccess }: ItemWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [itemForm, setItemForm] = useState<ItemFormData>({
    title: "",
    imageId: null,
    genres: [],
    description: "",
    director: "",
    cast: [],
    premiereYear: null,
    runningTime: null,
    country: "",
    rating: null,
    posterImageUrl: "",
    videoSources: [],
    captions: [],
    ...initialData,
  });

  // Input states for dynamic arrays
  const [genreInput, setGenreInput] = useState("");
  const [castInput, setCastInput] = useState("");
  const [videoSourceInput, setVideoSourceInput] = useState({ url: "", quality: "", type: "video/mp4" });
  const [captionInput, setCaptionInput] = useState({ label: "", srcLang: "", src: "", default: false });

  const createItem = useMutation(api.items.createItem);
  const updateItem = useMutation(api.items.updateItem);

  const steps = [
    { id: 1, title: "Basic Info", description: "Title, image, and genres" },
    { id: 2, title: "Details", description: "Description, cast, and metadata" },
    { id: 3, title: "Video Player", description: "Video sources and captions" },
    { id: 4, title: "Review", description: "Review and submit" },
  ];

  // Helper functions
  const addGenre = () => {
    if (genreInput.trim() && !itemForm.genres.includes(genreInput.trim())) {
      setItemForm(prev => ({
        ...prev,
        genres: [...prev.genres, genreInput.trim()]
      }));
      setGenreInput("");
    }
  };

  const removeGenre = (genre: string) => {
    setItemForm(prev => ({
      ...prev,
      genres: prev.genres.filter(g => g !== genre)
    }));
  };

  const addCast = () => {
    if (castInput.trim() && !itemForm.cast.includes(castInput.trim())) {
      setItemForm(prev => ({
        ...prev,
        cast: [...prev.cast, castInput.trim()]
      }));
      setCastInput("");
    }
  };

  const removeCast = (actor: string) => {
    setItemForm(prev => ({
      ...prev,
      cast: prev.cast.filter(c => c !== actor)
    }));
  };

  const addVideoSource = () => {
    if (videoSourceInput.url.trim() && videoSourceInput.quality.trim()) {
      setItemForm(prev => ({
        ...prev,
        videoSources: [...prev.videoSources, { ...videoSourceInput }]
      }));
      setVideoSourceInput({ url: "", quality: "", type: "video/mp4" });
    }
  };

  const removeVideoSource = (index: number) => {
    setItemForm(prev => ({
      ...prev,
      videoSources: prev.videoSources.filter((_, i) => i !== index)
    }));
  };

  const addCaption = () => {
    if (captionInput.label.trim() && captionInput.srcLang.trim() && captionInput.src.trim()) {
      setItemForm(prev => ({
        ...prev,
        captions: [...prev.captions, { ...captionInput }]
      }));
      setCaptionInput({ label: "", srcLang: "", src: "", default: false });
    }
  };

  const removeCaption = (index: number) => {
    setItemForm(prev => ({
      ...prev,
      captions: prev.captions.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!itemForm.title.trim() || !itemForm.imageId) return;

    try {
      if (editingItem) {
        await updateItem({
          itemId: editingItem,
          title: itemForm.title,
          imageId: itemForm.imageId,
          genres: itemForm.genres,
          description: itemForm.description || undefined,
          director: itemForm.director || undefined,
          cast: itemForm.cast.length > 0 ? itemForm.cast : undefined,
          premiereYear: itemForm.premiereYear || undefined,
          runningTime: itemForm.runningTime || undefined,
          country: itemForm.country || undefined,
          rating: itemForm.rating || undefined,
          posterImageUrl: itemForm.posterImageUrl || undefined,
          videoSources: itemForm.videoSources.length > 0 ? itemForm.videoSources : undefined,
          captions: itemForm.captions.length > 0 ? itemForm.captions : undefined,
        });
      } else {
        await createItem({
          categoryId,
          title: itemForm.title,
          imageId: itemForm.imageId,
          genres: itemForm.genres,
          description: itemForm.description || undefined,
          director: itemForm.director || undefined,
          cast: itemForm.cast.length > 0 ? itemForm.cast : undefined,
          premiereYear: itemForm.premiereYear || undefined,
          runningTime: itemForm.runningTime || undefined,
          country: itemForm.country || undefined,
          rating: itemForm.rating || undefined,
          posterImageUrl: itemForm.posterImageUrl || undefined,
          videoSources: itemForm.videoSources.length > 0 ? itemForm.videoSources : undefined,
          captions: itemForm.captions.length > 0 ? itemForm.captions : undefined,
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return itemForm.title.trim() && itemForm.imageId && itemForm.genres.length > 0;
      case 2:
        return true; // All fields in step 2 are optional
      case 3:
        return true; // All fields in step 3 are optional
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={itemForm.title}
                onChange={(e) => setItemForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Movie/Show title"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image *
              </label>
              <FileUpload
                onUploadComplete={(storageId) => setItemForm(prev => ({ ...prev, imageId: storageId }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genres *
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={genreInput}
                  onChange={(e) => setGenreInput(e.target.value)}
                  placeholder="Add genre"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                />
                <button
                  type="button"
                  onClick={addGenre}
                  className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {itemForm.genres.map((genre) => (
                  <span
                    key={genre}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => removeGenre(genre)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={itemForm.description}
                onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Movie/show description"
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Director
              </label>
              <input
                type="text"
                value={itemForm.director}
                onChange={(e) => setItemForm(prev => ({ ...prev, director: e.target.value }))}
                placeholder="Director name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cast
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={castInput}
                  onChange={(e) => setCastInput(e.target.value)}
                  placeholder="Add cast member"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCast())}
                />
                <button
                  type="button"
                  onClick={addCast}
                  className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {itemForm.cast.map((actor) => (
                  <span
                    key={actor}
                    className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                  >
                    {actor}
                    <button
                      type="button"
                      onClick={() => removeCast(actor)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Premiere Year
                </label>
                <input
                  type="number"
                  value={itemForm.premiereYear || ""}
                  onChange={(e) => setItemForm(prev => ({ 
                    ...prev, 
                    premiereYear: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  placeholder="2024"
                  min="1900"
                  max="2030"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Running Time (minutes)
                </label>
                <input
                  type="number"
                  value={itemForm.runningTime || ""}
                  onChange={(e) => setItemForm(prev => ({ 
                    ...prev, 
                    runningTime: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  placeholder="120"
                  min="1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={itemForm.country}
                  onChange={(e) => setItemForm(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="USA"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-10)
                </label>
                <input
                  type="number"
                  value={itemForm.rating || ""}
                  onChange={(e) => setItemForm(prev => ({ 
                    ...prev, 
                    rating: e.target.value ? parseFloat(e.target.value) : null 
                  }))}
                  placeholder="8.4"
                  min="1"
                  max="10"
                  step="0.1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poster Image URL
              </label>
              <input
                type="url"
                value={itemForm.posterImageUrl}
                onChange={(e) => setItemForm(prev => ({ ...prev, posterImageUrl: e.target.value }))}
                placeholder="https://example.com/poster.jpg"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Sources
              </label>
              <div className="grid grid-cols-12 gap-2 mb-2">
                <input
                  type="url"
                  value={videoSourceInput.url}
                  onChange={(e) => setVideoSourceInput(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="Video URL"
                  className="col-span-6 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={videoSourceInput.quality}
                  onChange={(e) => setVideoSourceInput(prev => ({ ...prev, quality: e.target.value }))}
                  placeholder="Quality (e.g., 720p)"
                  className="col-span-3 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={videoSourceInput.type}
                  onChange={(e) => setVideoSourceInput(prev => ({ ...prev, type: e.target.value }))}
                  className="col-span-2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="video/mp4">MP4</option>
                  <option value="video/webm">WebM</option>
                  <option value="video/ogg">OGG</option>
                </select>
                <button
                  type="button"
                  onClick={addVideoSource}
                  className="col-span-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  +
                </button>
              </div>
              <div className="space-y-2">
                {itemForm.videoSources.map((source, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    <span className="flex-1 text-sm">
                      <strong>{source.quality}</strong> - {source.url} ({source.type})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVideoSource(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Captions/Subtitles
              </label>
              <div className="grid grid-cols-12 gap-2 mb-2">
                <input
                  type="text"
                  value={captionInput.label}
                  onChange={(e) => setCaptionInput(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Label (e.g., English)"
                  className="col-span-3 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={captionInput.srcLang}
                  onChange={(e) => setCaptionInput(prev => ({ ...prev, srcLang: e.target.value }))}
                  placeholder="Lang (e.g., en)"
                  className="col-span-2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  value={captionInput.src}
                  onChange={(e) => setCaptionInput(prev => ({ ...prev, src: e.target.value }))}
                  placeholder="VTT file URL"
                  className="col-span-5 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={captionInput.default}
                    onChange={(e) => setCaptionInput(prev => ({ ...prev, default: e.target.checked }))}
                    className="mr-1"
                  />
                  <span className="text-xs">Default</span>
                </label>
                <button
                  type="button"
                  onClick={addCaption}
                  className="col-span-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  +
                </button>
              </div>
              <div className="space-y-2">
                {itemForm.cap}v>
  );

    </di/div>iv>
      < </d
       iv></d    )}
                >
  utton   </b          "}
 Create Item "tem" :e Im ? "UpdattingIte     {edi           
    >      d"
    -not-alloweorisabled:cursty-50 dd:opaciable00 disgreen-7g-r:bhoveunded-md white ro00 text-g-green-6 bpx-4 py-2e="lassNam   c            
 ed()}canProce={!   disabled         bmit}
    {handleSunClick=     o        
    <button   
             ) : (>
             </button          Next
         >
                     
"t-allowedrsor-no disabled:cuacity-50isabled:opue-700 dver:bg-blounded-md hoxt-white r0 te-60 bg-bluex-4 py-2e="psNam clas            
   ed()}{!canProce   disabled=     
        ext}andleNClick={h      on      on
          <butt         ? (
ength steps.ltep < {currentS          
    
         utton>    </b
             Cancel  
                 >y-200"
  hover:bg-gra-md oundeday-100 ry-600 bg-grt-grax-4 py-2 texame="passN        clse}
      ck={onCloonCli           on
   <butt          gap-2">
  "flex  className= <div              
   /button>
     <us
             Previo        >

        lowed"sor-not-albled:cury-50 disa:opaciteddisabl-gray-200 r:bgmd hoveunded-gray-100 roy-600 bg--gra-4 py-2 textassName="px    cl   = 1}
     entStep =={currled=      disabous}
      Previ={handleck  onCli
               <button  ">
   een-betwstify00 flex juer-gray-2rder-t bordx-6 py-4 bolassName="p     <div cter */}
   {/* Foo  

      div></        p()}
enderSte     {rh]">
     h-[60vo max--aut4 overflow-y"px-6 py-me=lassNa c      <div}
  ent *//* Cont      {

      </div>iv>
       </d   /div>
           <  }
    ))            
    </div>          )}
                   
       }`} />         '
      g-gray-200: 'blue-600' d ? 'bg-b step.ientStep >   curr         
          2 ${.5 w-1-4 h-0ame={`mxiv classN       <d            && (
   - 1thteps.leng< s{index                       </div>
              n}</div>
scriptiop.de{stexs">400 text-ray-ext-g"tame=iv classN       <d        >
           </div           
   e}titl{step.                     }>
 '}`xt-gray-500'telue-600' : ? 'text-btep.id ntStep >= sre${curt-medium ssName={`fondiv cla           <      >
   xt-sm"-2 tessName="ml <div cla            >
     </div           }
       ep.id       {st           
  }>  }`          '
      -gray-600-200 text: 'bg-gray                    
  te' xt-whi600 te-blue-   ? 'bg            
       step.id ntStep >=       curre            um ${
  sm font-medixt--full terounded8 er w-8 h-y-cententer justifitems-cflex assName={`    <div cl       >
       enter"items-cx e="flessNamep.id} clastdiv key={        <     (
    index) =>, (stepps.map(   {ste           >
center"tems-x issName="fle  <div cla          -4">
Name="mtclassiv        <d */}
   gress Steps Pro   {/* 
       >
                </div
   button>      </             ×
 >
                 00"
 -6r:text-gray0 hovet-gray-40"texlassName=          c
    lose}nCick={o     onCl         <button
            
/h2>         <tem"}
   d New I : "Adit Item"Item ? "Editing    {ed  >
        -gray-900"textt-bold xt-xl fonName="te<h2 class           tween">
 -befy justier-cent"flex items className= <div     ">
    y-200r-grarder-b bo py-4 bordeName="px-6lass      <div c
  ader */}   {/* Hen">
     -hiddeverflow ovh]-h-[90ax-w-4xl maxlg w-full mite rounded-Name="bg-whass cl      <div
r z-50">fy-cente justicenterx items-acity-50 fleopblack bg--0 bg-fixed insetclassName="v  <di  (
   return  }
  };

null;
   rn       retut:
    defaul;

    >
        )      </diviv>
           </d
       )}   
            </div>     s)
        h} language(s.lengtonorm.capti {itemFg>ns:</strong>Captio  <stron             v>
           <di      & (
  ngth > 0 &leptions.Form.ca    {item   
         )}         iv>
   /d       <)
         source(s} s.lengthdeoSourceitemForm.vi</strong> {ources:ng>Video S       <stro             <div>
        (
       > 0 && gthlenideoSources.mForm.v        {ite
             )}   >
          </div   10
       g}/emForm.ratin {it</strong>>Rating:     <strong      >
            <div           && (
 atingrm.r   {itemFo        )}
             </div>
                    country}
orm.emF> {itstrongountry:</>C <strong                 
  <div>      (
        & untry &.co   {itemForm          )}
           >
          </div        s
  minuteme} Tinningm.rutemForg> {iTime:</strong ong>Runnin <str                 <div>
                & (
ngTime &orm.runni      {itemF           )}
           </div>
               
 ereYear}remiorm.p{itemFr:</strong> iere Yearong>Prem         <st      >
     <div              && (
 iereYearemrm.pr{itemFo                 )}
            </div>
           
    )}, "oin("mForm.cast.jong> {ite/strtrong>Cast:<         <s     
      <div>           && (
    ength > 0orm.cast.l  {itemF    }
          )            v>
  </di           r}
   ectorm.dir{itemFotrong> /sctor:<ong>Dire     <str          div>
          <       
  tor && (.direcemForm        {it    
           )}/div>
      <         .
      g(0, 100)}...substrinonescriptirm.d{itemFong> rotion:</stong>Descripstr <           
      v>    <di         n && (
   escriptio {itemForm.d            v>
  </di         }
    ne"No"") || , s.join("orm.genre> {itemFtronges:</song>Genr   <str           div>
       <    
           </div>       m.title}
 Forng> {itemstroTitle:</ng>tro <s              
  <div>            
 ce-y-3">ded-md spa4 rounray-50 p-g-gsName="bas<div cl                      
h3>
  tem</eview Your I900">Rgray-um text-lg font-mediext-Name="t class     <h3     
  -y-4">ame="spaceiv classN        <dturn (
  
        rese 4:
      ca      );
iv>
          </d
     </div>         div>
         </  }
             ))    
  >iv       </d           
</button>                  ×
                 
               >            d-800"
text-reer:hovred-600 t-sName="tex      clas          
      ndex)}aption(iveCremo) =>   onClick={(                    "
tontype="but                      button
          <          
n></spa          
          span>}[Default]</2">l- m-600text-blueName=" <span classn.default &&ptio       {ca              tion.src}
 ) - {capsrcLang}> ({caption.nglabel}</stro{caption.  <strong>                
    >sm"text-e="flex-1 ssNamcla  <span            ">
       mded- round2 bg-gray-50gap-2 p-ems-center "flex itName= classdex}v key={in<di           > (
       ndex) =tion, is.map((caption