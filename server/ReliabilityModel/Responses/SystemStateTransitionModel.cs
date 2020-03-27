namespace ReliabilityModel.Model.Responses
{
    public class SystemStateTransitionModel
    {
        public SystemStateModel ToState { get; set; }

        public bool IsRecovering { get; set; }

        public double WithRate { get; set; }
    }
}
